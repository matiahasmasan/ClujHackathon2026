from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserPublic, UsersListResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UsersListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> UsersListResponse:
    result = await db.scalars(select(User).order_by(User.id))
    users = result.all()
    return UsersListResponse(
        message="hello users",
        count=len(users),
        users=[UserPublic.model_validate(user) for user in users],
    )
