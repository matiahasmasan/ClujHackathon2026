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


class PricingPlanCreate(BaseModel):
    name: str
    tagline: str = ""
    price_monthly: Decimal
    price_yearly: Decimal | None = None
    currency: str = "USD"
    is_highlighted: bool = False
    cta_label: str = "Get Started"
    cta_href: str = "/signup"
    sort_order: int = 0


class PricingPlanUpdate(BaseModel):
    name: str | None = None
    tagline: str | None = None
    price_monthly: Decimal | None = None
    price_yearly: Decimal | None = None
    currency: str | None = None
    is_highlighted: bool | None = None
    cta_label: str | None = None
    cta_href: str | None = None
    sort_order: int | None = None


class PricingFeatureCreate(BaseModel):
    label: str
    sort_order: int = 0


class PricingFeatureUpdate(BaseModel):
    label: str | None = None
    sort_order: int | None = None
