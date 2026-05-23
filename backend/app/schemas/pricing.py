from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PricingFeatureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    sort_order: int


class PricingPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tagline: str
    price_monthly: Decimal
    price_yearly: Decimal | None
    currency: str
    is_highlighted: bool
    cta_label: str
    cta_href: str
    sort_order: int
    features: list[PricingFeatureOut]


class PricingListResponse(BaseModel):
    count: int
    plans: list[PricingPlanOut]
