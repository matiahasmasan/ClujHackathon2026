from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


PAYMENT_STATUSES = ("pending", "succeeded", "failed", "refunded", "canceled")


class PaymentCreate(BaseModel):
    user_id: int
    subscription_id: int | None = None
    stripe_payment_intent_id: str | None = Field(None, max_length=100)
    stripe_invoice_id: str | None = Field(None, max_length=100)
    amount: int = Field(..., gt=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    status: str = Field("pending", max_length=30)
    paid_at: datetime | None = None
    failed_at: datetime | None = None
    failure_reason: str | None = None


class PaymentUpdate(BaseModel):
    user_id: int | None = None
    subscription_id: int | None = None
    stripe_payment_intent_id: str | None = Field(None, max_length=100)
    stripe_invoice_id: str | None = Field(None, max_length=100)
    amount: int | None = Field(None, gt=0)
    currency: str | None = Field(None, min_length=3, max_length=3)
    status: str | None = Field(None, max_length=30)
    paid_at: datetime | None = None
    failed_at: datetime | None = None
    failure_reason: str | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subscription_id: int | None
    stripe_payment_intent_id: str | None
    stripe_invoice_id: str | None
    amount: int
    currency: str
    status: str
    paid_at: datetime | None
    failed_at: datetime | None
    failure_reason: str | None
    created_at: datetime


class PaymentWithUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subscription_id: int | None
    stripe_payment_intent_id: str | None
    stripe_invoice_id: str | None
    amount: int
    currency: str
    status: str
    paid_at: datetime | None
    failed_at: datetime | None
    failure_reason: str | None
    created_at: datetime
    user_first_name: str
    user_last_name: str
    user_email: str


class PaymentsListResponse(BaseModel):
    count: int
    payments: list[PaymentOut]


class AdminPaymentsListResponse(BaseModel):
    count: int
    payments: list[PaymentWithUserOut]
