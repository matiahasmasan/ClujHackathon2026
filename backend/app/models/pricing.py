from decimal import Decimal

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PricingPlan(Base):
    """Maps the `pricing_plans` table."""

    __tablename__ = "pricing_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    tagline: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    price_monthly: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    price_yearly: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    is_highlighted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    cta_label: Mapped[str] = mapped_column(String(80), nullable=False, default="Get Started")
    cta_href: Mapped[str] = mapped_column(String(200), nullable=False, default="/signup")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    features: Mapped[list["PricingPlanFeature"]] = relationship(
        "PricingPlanFeature",
        back_populates="plan",
        order_by="PricingPlanFeature.sort_order",
        lazy="selectin",
    )


class PricingPlanFeature(Base):
    """Maps the `pricing_plan_features` table."""

    __tablename__ = "pricing_plan_features"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pricing_plans.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    plan: Mapped["PricingPlan"] = relationship("PricingPlan", back_populates="features")
