from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Senior(Base):
    """Maps the existing `seniors` table."""

    __tablename__ = "seniors"

    id: Mapped[int] = mapped_column(primary_key=True)
    caregiver_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    diagnoses: Mapped[str | None] = mapped_column(Text)
    phone_number: Mapped[str] = mapped_column(String(11), nullable=False)
