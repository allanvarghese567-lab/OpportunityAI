"""Phase 4 models: Approvals, Execution Actions, Outcomes."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    strategy_snapshot: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    decided_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ExecutionAction(Base):
    __tablename__ = "execution_actions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[int] = mapped_column(ForeignKey("approvals.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_cost: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    estimated_revenue: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    authorized_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    actual_revenue: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[Dict[str, Any]] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Outcome(Base):
    __tablename__ = "outcomes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[Optional[int]] = mapped_column(ForeignKey("approvals.id", ondelete="SET NULL"), nullable=True)
    starting_capital: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    target_ending_cash: Mapped[Decimal] = mapped_column(Numeric(18, 2), nullable=False)
    actual_ending_cash: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    total_spent: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_received: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    net_result: Mapped[Optional[Decimal]] = mapped_column(Numeric(18, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="projected", index=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lessons: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    report_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
