from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    body: str | None = Field(None, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    body: str | None = Field(None, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    rating: int
    body: str | None
    created_at: datetime
    updated_at: datetime


class ReviewWithUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    rating: int
    body: str | None
    created_at: datetime
    updated_at: datetime
    user_first_name: str
    user_last_name: str
    user_email: str


class ReviewsListResponse(BaseModel):
    count: int
    reviews: list[ReviewOut]


class AdminReviewsListResponse(BaseModel):
    count: int
    reviews: list[ReviewWithUserOut]
