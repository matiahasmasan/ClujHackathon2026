from datetime import time

from sqlalchemy import Boolean, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Medication(Base):
    """Maps the existing `medications` table."""

    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True)
    senior_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("seniors.id", ondelete="CASCADE"), nullable=True
    )
    medication_name: Mapped[str] = mapped_column(String(100), nullable=False)
    dose: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_taken_today: Mapped[bool] = mapped_column(Boolean, default=False)
    stock: Mapped[int] = mapped_column("stocks", Integer, default=0)
