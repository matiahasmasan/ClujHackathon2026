from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
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
    phone_number: Mapped[str] = mapped_column(String(12), nullable=False)
    # `default` fills the value from the app on every INSERT, so it works even
    # if the DB column has no DEFAULT; `server_default` covers DB-side inserts.
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.current_timestamp(),
        server_default=func.current_timestamp(),
    )
