from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.pricing import PricingPlan
from app.schemas.pricing import PricingListResponse, PricingPlanOut

router = APIRouter(prefix="/pricing", tags=["pricing"])


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
