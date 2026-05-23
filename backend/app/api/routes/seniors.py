from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.senior import Senior
from app.models.user import User
from app.schemas.senior import SeniorCreate, SeniorOut, SeniorsListResponse

router = APIRouter(prefix="/seniors", tags=["seniors"])


@router.get("", response_model=SeniorsListResponse)
async def list_seniors(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SeniorsListResponse:
    result = await db.scalars(
        select(Senior)
        .where(Senior.caregiver_id == current_user.id)
        .order_by(Senior.last_name, Senior.first_name)
    )
    seniors = result.all()
    return SeniorsListResponse(
        count=len(seniors),
        seniors=[SeniorOut.model_validate(s) for s in seniors],
    )


@router.post("", response_model=SeniorOut, status_code=status.HTTP_201_CREATED)
async def create_senior(
    payload: SeniorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Senior:
    senior = Senior(
        caregiver_id=current_user.id,
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        age=payload.age,
        gender=payload.gender.strip(),
        diagnoses=payload.diagnoses.strip(),
        phone_number=payload.phone_number.strip(),
    )
    db.add(senior)
    await db.commit()
    await db.refresh(senior)
    return senior
