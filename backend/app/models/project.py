from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    configurations: Mapped[List["Configuration"]] = relationship(
        "Configuration", back_populates="project", cascade="all, delete-orphan"
    )


class Configuration(Base):
    __tablename__ = "configurations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    starting_capital: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    target_ending_cash: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    opportunity_preferences: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    resources: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    risk_limits: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    priorities: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    project: Mapped["Project"] = relationship("Project", back_populates="configurations")
