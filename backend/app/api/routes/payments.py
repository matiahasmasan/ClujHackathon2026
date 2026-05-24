import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.payment import Payment
from app.models.pricing import PricingPlan
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.payment import (
    AdminPaymentsListResponse,
    CheckoutRequest,
    CheckoutResponse,
    PaymentCreate,
    PaymentOut,
    PaymentUpdate,
    PaymentWithUserOut,
    PaymentsListResponse,
)

router = APIRouter(prefix="/payments", tags=["payments"])


def _require_admin(current_user: User) -> None:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


async def _get_payment(payment_id: int, db: AsyncSession) -> Payment:
    payment = await db.scalar(select(Payment).where(Payment.id == payment_id))
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found.")
    return payment


def _normalize_status(status_value: str) -> str:
    return status_value.strip().lower()


def _fake_stripe_id(prefix: str) -> str:
    return f"{prefix}_sim_{secrets.token_hex(12)}"


# ── Caregiver endpoints ───────────────────────────────────────────────────────


@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckoutResponse:
    """Simulate a Stripe payment: creates/updates a subscription and a succeeded payment."""
    plan = await db.scalar(select(PricingPlan).where(PricingPlan.id == payload.plan_id))
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing plan not found.")

    digits_only = "".join(ch for ch in payload.card_number if ch.isdigit())
    if len(digits_only) < 12 or len(digits_only) > 19:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid card number.")

    now = datetime.now(UTC)
    period_end = now + timedelta(days=30)
    amount_cents = int(round(float(plan.price_monthly) * 100))
    currency = plan.currency or "USD"

    subscription = await db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    if subscription:
        subscription.plan_id = plan.id
        subscription.status = "active"
        subscription.current_period_start = now
        subscription.current_period_end = period_end
        subscription.cancel_at_period_end = False
        subscription.canceled_at = None
        subscription.updated_at = now
    else:
        subscription = Subscription(
            user_id=current_user.id,
            plan_id=plan.id,
            stripe_customer_id=_fake_stripe_id("cus"),
            stripe_subscription_id=_fake_stripe_id("sub"),
            status="active",
            current_period_start=now,
            current_period_end=period_end,
            cancel_at_period_end=False,
        )
        db.add(subscription)

    await db.flush()

    payment = Payment(
        user_id=current_user.id,
        subscription_id=subscription.id,
        stripe_payment_intent_id=_fake_stripe_id("pi"),
        stripe_invoice_id=_fake_stripe_id("in"),
        amount=amount_cents,
        currency=currency,
        status="succeeded",
        paid_at=now,
    )
    db.add(payment)

    await db.commit()
    await db.refresh(payment)
    await db.refresh(subscription)

    return CheckoutResponse(
        payment=PaymentOut.model_validate(payment),
        subscription_id=subscription.id,
        plan_name=plan.name,
    )


@router.get("", response_model=PaymentsListResponse)
async def list_my_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaymentsListResponse:
    result = await db.scalars(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.all()
    return PaymentsListResponse(
        count=len(payments),
        payments=[PaymentOut.model_validate(p) for p in payments],
    )


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=AdminPaymentsListResponse)
async def list_all_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminPaymentsListResponse:
    _require_admin(current_user)
    result = await db.execute(
        select(Payment, User)
        .join(User, Payment.user_id == User.id)
        .order_by(Payment.created_at.desc())
    )
    rows = result.all()
    payments = [
        PaymentWithUserOut(
            id=payment.id,
            user_id=payment.user_id,
            subscription_id=payment.subscription_id,
            stripe_payment_intent_id=payment.stripe_payment_intent_id,
            stripe_invoice_id=payment.stripe_invoice_id,
            amount=payment.amount,
            currency=payment.currency,
            status=payment.status,
            paid_at=payment.paid_at,
            failed_at=payment.failed_at,
            failure_reason=payment.failure_reason,
            created_at=payment.created_at,
            user_first_name=user.first_name,
            user_last_name=user.last_name,
            user_email=user.email,
        )
        for payment, user in rows
    ]
    return AdminPaymentsListResponse(count=len(payments), payments=payments)


@router.post("", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payload: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Payment:
    _require_admin(current_user)
    user = await db.scalar(select(User).where(User.id == payload.user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    status_value = _normalize_status(payload.status)
    payment = Payment(
        user_id=payload.user_id,
        subscription_id=payload.subscription_id,
        stripe_payment_intent_id=payload.stripe_payment_intent_id,
        stripe_invoice_id=payload.stripe_invoice_id,
        amount=payload.amount,
        currency=payload.currency.upper(),
        status=status_value,
        paid_at=payload.paid_at,
        failed_at=payload.failed_at,
        failure_reason=payload.failure_reason,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.patch("/{payment_id}", response_model=PaymentOut)
async def update_payment(
    payment_id: int,
    payload: PaymentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Payment:
    _require_admin(current_user)
    payment = await _get_payment(payment_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if "user_id" in updates:
        user = await db.scalar(select(User).where(User.id == updates["user_id"]))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if "status" in updates and updates["status"] is not None:
        updates["status"] = _normalize_status(updates["status"])
    if "currency" in updates and updates["currency"] is not None:
        updates["currency"] = updates["currency"].upper()
    if "stripe_payment_intent_id" in updates:
        updates["stripe_payment_intent_id"] = updates["stripe_payment_intent_id"] or None
    if "stripe_invoice_id" in updates:
        updates["stripe_invoice_id"] = updates["stripe_invoice_id"] or None
    if "failure_reason" in updates:
        reason = updates["failure_reason"]
        updates["failure_reason"] = reason.strip() if reason else None

    for key, value in updates.items():
        setattr(payment, key, value)

    await db.commit()
    await db.refresh(payment)
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment(
    payment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_admin(current_user)
    payment = await _get_payment(payment_id, db)
    await db.delete(payment)
    await db.commit()
