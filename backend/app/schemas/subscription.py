from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SubscriptionCreate(BaseModel):
    user_id: int
    plan_id: int
    stripe_customer_id: str = Field(..., min_length=1, max_length=100)
    stripe_subscription_id: str = Field(..., min_length=1, max_length=100)
    status: str = Field("active", max_length=30)
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    canceled_at: datetime | None = None


class SubscriptionUpdate(BaseModel):
    user_id: int | None = None
    plan_id: int | None = None
    stripe_customer_id: str | None = Field(None, min_length=1, max_length=100)
    stripe_subscription_id: str | None = Field(None, min_length=1, max_length=100)
    status: str | None = Field(None, max_length=30)
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    cancel_at_period_end: bool | None = None
    canceled_at: datetime | None = None


class SubscriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan_id: int
    stripe_customer_id: str
    stripe_subscription_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    canceled_at: datetime | None
    created_at: datetime
    updated_at: datetime
    plan_name: str | None = None
    plan_price_monthly: Decimal | None = None
    plan_currency: str | None = None


class SubscriptionWithUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan_id: int
    stripe_customer_id: str
    stripe_subscription_id: str
    status: str
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool
    canceled_at: datetime | None
    created_at: datetime
    updated_at: datetime
    plan_name: str | None = None
    plan_price_monthly: Decimal | None = None
    plan_currency: str | None = None
    user_first_name: str
    user_last_name: str
    user_email: str


class SubscriptionsListResponse(BaseModel):
    count: int
    subscriptions: list[SubscriptionOut]


class AdminSubscriptionsListResponse(BaseModel):
    count: int
    subscriptions: list[SubscriptionWithUserOut]
