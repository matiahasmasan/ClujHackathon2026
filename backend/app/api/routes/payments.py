from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import (
    AdminPaymentsListResponse,
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


# ── Caregiver endpoints ───────────────────────────────────────────────────────

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
