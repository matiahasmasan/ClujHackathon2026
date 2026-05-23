from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import (
    AdminReviewsListResponse,
    ReviewCreate,
    ReviewOut,
    ReviewsListResponse,
    ReviewUpdate,
    ReviewWithUserOut,
)

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _require_admin(current_user: User) -> None:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


async def _get_own_review(review_id: int, user_id: int, db: AsyncSession) -> Review:
    review = await db.scalar(
        select(Review).where(Review.id == review_id, Review.user_id == user_id)
    )
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    return review


# ── Caregiver endpoints ───────────────────────────────────────────────────────

@router.get("", response_model=ReviewsListResponse)
async def list_my_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ReviewsListResponse:
    result = await db.scalars(
        select(Review)
        .where(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.all()
    return ReviewsListResponse(
        count=len(reviews),
        reviews=[ReviewOut.model_validate(r) for r in reviews],
    )


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    review = Review(
        user_id=current_user.id,
        rating=payload.rating,
        body=payload.body.strip() if payload.body else None,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.patch("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    review = await _get_own_review(review_id, current_user.id, db)
    if payload.rating is not None:
        review.rating = payload.rating
    if payload.body is not None:
        review.body = payload.body.strip() or None
    review.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if current_user.role == "admin":
        review = await db.scalar(select(Review).where(Review.id == review_id))
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    else:
        review = await _get_own_review(review_id, current_user.id, db)
    await db.delete(review)
    await db.commit()


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=AdminReviewsListResponse)
async def list_all_reviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdminReviewsListResponse:
    _require_admin(current_user)
    result = await db.execute(
        select(Review, User)
        .join(User, Review.user_id == User.id)
        .order_by(Review.created_at.desc())
    )
    rows = result.all()
    reviews = [
        ReviewWithUserOut(
            id=review.id,
            user_id=review.user_id,
            rating=review.rating,
            body=review.body,
            created_at=review.created_at,
            updated_at=review.updated_at,
            user_first_name=user.first_name,
            user_last_name=user.last_name,
            user_email=user.email,
        )
        for review, user in rows
    ]
    return AdminReviewsListResponse(count=len(reviews), reviews=reviews)
