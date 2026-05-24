from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.pricing import PricingPlan, PricingPlanFeature
from app.models.user import User
from app.schemas.pricing import (
    PricingFeatureCreate,
    PricingFeatureOut,
    PricingFeatureUpdate,
    PricingListResponse,
    PricingPlanCreate,
    PricingPlanOut,
    PricingPlanUpdate,
)

router = APIRouter(prefix="/pricing", tags=["pricing"])


def _require_admin(current_user: User) -> None:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )


@router.get("", response_model=PricingListResponse)
async def list_pricing_plans(
    db: AsyncSession = Depends(get_db),
) -> PricingListResponse:
    result = await db.scalars(
        select(PricingPlan).order_by(PricingPlan.sort_order, PricingPlan.id)
    )
    plans = result.all()
    return PricingListResponse(
        count=len(plans),
        plans=[PricingPlanOut.model_validate(plan) for plan in plans],
    )


@router.post("", response_model=PricingPlanOut, status_code=status.HTTP_201_CREATED)
async def create_plan(
    payload: PricingPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PricingPlanOut:
    _require_admin(current_user)
    plan = PricingPlan(**payload.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return PricingPlanOut.model_validate(plan)


@router.patch("/{plan_id}", response_model=PricingPlanOut)
async def update_plan(
    plan_id: int,
    payload: PricingPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PricingPlanOut:
    _require_admin(current_user)
    plan = await db.get(PricingPlan, plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(plan, field, value)
    await db.commit()
    await db.refresh(plan)
    return PricingPlanOut.model_validate(plan)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_admin(current_user)
    plan = await db.get(PricingPlan, plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found.")
    await db.delete(plan)
    await db.commit()


@router.post("/{plan_id}/features", response_model=PricingFeatureOut, status_code=status.HTTP_201_CREATED)
async def create_feature(
    plan_id: int,
    payload: PricingFeatureCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PricingFeatureOut:
    _require_admin(current_user)
    plan = await db.get(PricingPlan, plan_id)
    if plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found.")
    feature = PricingPlanFeature(plan_id=plan_id, **payload.model_dump())
    db.add(feature)
    await db.commit()
    await db.refresh(feature)
    return PricingFeatureOut.model_validate(feature)


@router.patch("/features/{feature_id}", response_model=PricingFeatureOut)
async def update_feature(
    feature_id: int,
    payload: PricingFeatureUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PricingFeatureOut:
    _require_admin(current_user)
    feature = await db.get(PricingPlanFeature, feature_id)
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found.")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(feature, field, value)
    await db.commit()
    await db.refresh(feature)
    return PricingFeatureOut.model_validate(feature)


@router.delete("/features/{feature_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feature(
    feature_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _require_admin(current_user)
    feature = await db.get(PricingPlanFeature, feature_id)
    if feature is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature not found.")
    await db.delete(feature)
    await db.commit()
