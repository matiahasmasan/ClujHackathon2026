from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.pricing import PricingPlan
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.subscription import (
    AdminSubscriptionsListResponse,
    SubscriptionCreate,
    SubscriptionOut,
    SubscriptionUpdate,
    SubscriptionWithUserOut,
    SubscriptionsListResponse,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


def _require_admin(current_user: User) -> None:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


def _normalize_status(status_value: str) -> str:
    return status_value.strip().lower()


async def _get_subscription(subscription_id: int, db: AsyncSession) -> Subscription:
    subscription = await db.scalar(select(Subscription).where(Subscription.id == subscription_id))
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return subscription


def _subscription_out(subscription: Subscription, plan: PricingPlan | None) -> SubscriptionOut:
    return SubscriptionOut(
        id=subscription.id,
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        stripe_customer_id=subscription.stripe_customer_id,
        stripe_subscription_id=subscription.stripe_subscription_id,
        status=subscription.status,
        current_period_start=subscription.current_period_start,
        current_period_end=subscription.current_period_end,
        cancel_at_period_end=subscription.cancel_at_period_end,
        canceled_at=subscription.canceled_at,
        created_at=subscription.created_at,
        updated_at=subscription.updated_at,
        plan_name=plan.name if plan else None,
        plan_price_monthly=plan.price_monthly if plan else None,
        plan_currency=plan.currency if plan else None,
    )


# ── Caregiver endpoints ───────────────────────────────────────────────────────

@router.get("", response_model=SubscriptionsListResponse)
async def list_my_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubscriptionsListResponse:
    result = await db.execute(
        select(Subscription, PricingPlan)
        .join(PricingPlan, Subscription.plan_id == PricingPlan.id)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.created_at.desc())
    )
    rows = result.all()
    subscriptions = [_subscription_out(sub, plan) for sub, plan in rows]
    return SubscriptionsListResponse(count=len(subscriptions), subscriptions=subscriptions)


@router.post("/mine/cancel", response_model=SubscriptionOut)
async def cancel_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubscriptionOut:
    subscription = await db.scalar(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    if not subscription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")

    if subscription.cancel_at_period_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subscription is already set to cancel at period end.",
        )

    status_value = subscription.status.lower()
    if status_value in {"canceled", "cancelled", "unpaid", "incomplete_expired"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This subscription is no longer active.",
        )

    subscription.cancel_at_period_end = True
    subscription.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(subscription)

    plan = await db.scalar(select(PricingPlan).where(PricingPlan.id == subscription.plan_id))
    return _subscription_out(subscription, plan)


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=AdminSubscriptionsListResponse)
async def list_all_subscriptions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminSubscriptionsListResponse:
    _require_admin(current_user)
    result = await db.execute(
        select(Subscription, User, PricingPlan)
        .join(User, Subscription.user_id == User.id)
        .join(PricingPlan, Subscription.plan_id == PricingPlan.id)
        .order_by(Subscription.created_at.desc())
    )
    rows = result.all()
    subscriptions = [
        SubscriptionWithUserOut(
            id=subscription.id,
            user_id=subscription.user_id,
            plan_id=subscription.plan_id,
            stripe_customer_id=subscription.stripe_customer_id,
            stripe_subscription_id=subscription.stripe_subscription_id,
            status=subscription.status,
            current_period_start=subscription.current_period_start,
            current_period_end=subscription.current_period_end,
            cancel_at_period_end=subscription.cancel_at_period_end,
            canceled_at=subscription.canceled_at,
            created_at=subscription.created_at,
            updated_at=subscription.updated_at,
            plan_name=plan.name,
            plan_price_monthly=plan.price_monthly,
            plan_currency=plan.currency,
            user_first_name=user.first_name,
            user_last_name=user.last_name,
            user_email=user.email,
        )
        for subscription, user, plan in rows
    ]
    return AdminSubscriptionsListResponse(count=len(subscriptions), subscriptions=subscriptions)


@router.post("", response_model=SubscriptionOut, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    payload: SubscriptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubscriptionOut:
    _require_admin(current_user)

    user = await db.scalar(select(User).where(User.id == payload.user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    plan = await db.scalar(select(PricingPlan).where(PricingPlan.id == payload.plan_id))
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing plan not found.")

    existing = await db.scalar(
        select(Subscription).where(Subscription.user_id == payload.user_id)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user already has a subscription.",
        )

    subscription = Subscription(
        user_id=payload.user_id,
        plan_id=payload.plan_id,
        stripe_customer_id=payload.stripe_customer_id.strip(),
        stripe_subscription_id=payload.stripe_subscription_id.strip(),
        status=_normalize_status(payload.status),
        current_period_start=payload.current_period_start,
        current_period_end=payload.current_period_end,
        cancel_at_period_end=payload.cancel_at_period_end,
        canceled_at=payload.canceled_at,
    )
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return _subscription_out(subscription, plan)


@router.patch("/{subscription_id}", response_model=SubscriptionOut)
async def update_subscription(
    subscription_id: int,
    payload: SubscriptionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubscriptionOut:
    _require_admin(current_user)
    subscription = await _get_subscription(subscription_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if "user_id" in updates:
        user = await db.scalar(select(User).where(User.id == updates["user_id"]))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        conflict = await db.scalar(
            select(Subscription).where(
                Subscription.user_id == updates["user_id"],
                Subscription.id != subscription_id,
            )
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This user already has a subscription.",
            )
    if "plan_id" in updates:
        plan = await db.scalar(select(PricingPlan).where(PricingPlan.id == updates["plan_id"]))
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pricing plan not found.")
    if "status" in updates and updates["status"] is not None:
        updates["status"] = _normalize_status(updates["status"])
    if "stripe_customer_id" in updates and updates["stripe_customer_id"] is not None:
        updates["stripe_customer_id"] = updates["stripe_customer_id"].strip()
    if "stripe_subscription_id" in updates and updates["stripe_subscription_id"] is not None:
        updates["stripe_subscription_id"] = updates["stripe_subscription_id"].strip()

    updates["updated_at"] = datetime.now(UTC)

    for key, value in updates.items():
        setattr(subscription, key, value)

    await db.commit()
    await db.refresh(subscription)

    plan = await db.scalar(select(PricingPlan).where(PricingPlan.id == subscription.plan_id))
    return _subscription_out(subscription, plan)


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    subscription_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_admin(current_user)
    subscription = await _get_subscription(subscription_id, db)
    await db.delete(subscription)
    await db.commit()
