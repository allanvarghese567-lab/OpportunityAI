from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ApprovalCreate(BaseModel):
    strategy_snapshot: Dict[str, Any]
    rationale: Optional[str] = None


class ApprovalDecide(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    rejection_reason: Optional[str] = None


class ApprovalRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    status: str
    strategy_snapshot: Dict[str, Any]
    rationale: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    decided_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class ExecutionActionCreate(BaseModel):
    action_type: str
    description: str
    estimated_cost: Decimal = Field(default=Decimal("0"), ge=0)
    estimated_revenue: Decimal = Field(default=Decimal("0"), ge=0)


class ExecutionActionUpdate(BaseModel):
    status: Optional[str] = None
    actual_cost: Optional[Decimal] = None
    actual_revenue: Optional[Decimal] = None
    notes: Optional[str] = None


class ExecutionActionRead(BaseModel):
    id: int
    project_id: int
    approval_id: int
    action_type: str
    description: str
    estimated_cost: Decimal
    estimated_revenue: Decimal
    status: str
    authorized_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    actual_cost: Optional[Decimal] = None
    actual_revenue: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class OutcomeCreate(BaseModel):
    starting_capital: Decimal
    target_ending_cash: Decimal
    approval_id: Optional[int] = None


class OutcomeComplete(BaseModel):
    actual_ending_cash: Decimal
    total_spent: Decimal = Decimal("0")
    total_received: Decimal = Decimal("0")
    summary: Optional[str] = None
    lessons: Optional[str] = None


class OutcomeRead(BaseModel):
    id: int
    project_id: int
    approval_id: Optional[int] = None
    starting_capital: Decimal
    target_ending_cash: Decimal
    actual_ending_cash: Optional[Decimal] = None
    total_spent: Decimal
    total_received: Decimal
    net_result: Optional[Decimal] = None
    status: str
    summary: Optional[str] = None
    lessons: Optional[str] = None
    report_data: Dict[str, Any] = {}
    created_at: datetime
    completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
