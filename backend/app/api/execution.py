"""Phase 4: Approvals, Execution Actions, Outcomes, Reports."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.agents.reporting import generate_report
from app.api.deps import CurrentUser, DbSession
from app.models.execution import Approval, ExecutionAction, Outcome
from app.models.project import Project
from app.schemas.execution import (
    ApprovalCreate, ApprovalDecide, ApprovalRead,
    ExecutionActionCreate, ExecutionActionRead, ExecutionActionUpdate,
    OutcomeComplete, OutcomeCreate, OutcomeRead,
)

router = APIRouter(prefix="/execution", tags=["execution"])


@router.post("/projects/{project_id}/approvals", response_model=ApprovalRead, status_code=status.HTTP_201_CREATED)
async def create_approval(project_id: int, body: ApprovalCreate, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    approval = Approval(project_id=project_id, user_id=current_user.id, status="pending",
                        strategy_snapshot=body.strategy_snapshot, rationale=body.rationale)
    db.add(approval)
    await db.flush()
    await db.refresh(approval)
    return approval


@router.get("/projects/{project_id}/approvals", response_model=List[ApprovalRead])
async def list_approvals(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    result = await db.execute(select(Approval).where(Approval.project_id == project_id).order_by(Approval.created_at.desc()))
    return result.scalars().all()


@router.post("/projects/{project_id}/approvals/{approval_id}/decide", response_model=ApprovalRead)
async def decide_approval(project_id: int, approval_id: int, body: ApprovalDecide, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Approval).join(Project).where(
            Approval.id == approval_id, Approval.project_id == project_id, Project.owner_id == current_user.id))
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "pending":
        raise HTTPException(status_code=400, detail="Approval already decided")
    approval.status = body.status
    approval.decided_at = datetime.now(timezone.utc)
    if body.status == "rejected":
        approval.rejection_reason = body.rejection_reason
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one()
    project.status = "approved" if body.status == "approved" else "rejected"
    await db.flush()
    await db.refresh(approval)
    return approval


@router.post("/projects/{project_id}/approvals/{approval_id}/actions", response_model=ExecutionActionRead, status_code=status.HTTP_201_CREATED)
async def create_action(project_id: int, approval_id: int, body: ExecutionActionCreate, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Approval).join(Project).where(
            Approval.id == approval_id, Approval.project_id == project_id, Project.owner_id == current_user.id))
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "approved":
        raise HTTPException(status_code=400, detail="Can only add actions to an approved strategy")
    result = await db.execute(
        select(Project).options(selectinload(Project.configurations)).where(Project.id == project_id))
    project = result.scalar_one()
    confirmed = [c for c in project.configurations if c.status == "confirmed"]
    if confirmed:
        risk = confirmed[0].risk_limits or {}
        max_loss = float(risk.get("max_single_loss", 999999))
        if float(body.estimated_cost) > max_loss:
            raise HTTPException(status_code=400, detail=f"Estimated cost exceeds max single loss limit {max_loss}")
    action = ExecutionAction(
        project_id=project_id, approval_id=approval_id, action_type=body.action_type,
        description=body.description, estimated_cost=body.estimated_cost,
        estimated_revenue=body.estimated_revenue, status="pending")
    db.add(action)
    await db.flush()
    await db.refresh(action)
    return action


@router.get("/projects/{project_id}/actions", response_model=List[ExecutionActionRead])
async def list_actions(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    result = await db.execute(
        select(ExecutionAction).where(ExecutionAction.project_id == project_id).order_by(ExecutionAction.created_at.desc()))
    return result.scalars().all()


@router.post("/projects/{project_id}/actions/{action_id}/authorize", response_model=ExecutionActionRead)
async def authorize_action(project_id: int, action_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(ExecutionAction).join(Project).where(
            ExecutionAction.id == action_id, ExecutionAction.project_id == project_id, Project.owner_id == current_user.id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status != "pending":
        raise HTTPException(status_code=400, detail=f"Action is already {action.status}")
    result = await db.execute(select(Approval).where(Approval.id == action.approval_id))
    approval = result.scalar_one()
    if approval.status != "approved":
        raise HTTPException(status_code=400, detail="Parent approval is not approved")
    action.status = "authorized"
    action.authorized_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(action)
    return action


@router.post("/projects/{project_id}/actions/{action_id}/execute", response_model=ExecutionActionRead)
async def execute_action(project_id: int, action_id: int, body: ExecutionActionUpdate, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(ExecutionAction).join(Project).where(
            ExecutionAction.id == action_id, ExecutionAction.project_id == project_id, Project.owner_id == current_user.id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    if action.status != "authorized":
        raise HTTPException(status_code=400, detail="Action must be authorized before execution")
    action.status = "executed"
    action.executed_at = datetime.now(timezone.utc)
    if body.actual_cost is not None:
        action.actual_cost = body.actual_cost
    if body.actual_revenue is not None:
        action.actual_revenue = body.actual_revenue
    if body.notes:
        action.notes = body.notes
    await db.flush()
    await db.refresh(action)
    return action


@router.post("/projects/{project_id}/outcomes", response_model=OutcomeRead, status_code=status.HTTP_201_CREATED)
async def create_outcome(project_id: int, body: OutcomeCreate, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    outcome = Outcome(project_id=project_id, approval_id=body.approval_id,
                      starting_capital=body.starting_capital, target_ending_cash=body.target_ending_cash, status="in_progress")
    db.add(outcome)
    await db.flush()
    await db.refresh(outcome)
    return outcome


@router.post("/projects/{project_id}/outcomes/{outcome_id}/complete", response_model=OutcomeRead)
async def complete_outcome(project_id: int, outcome_id: int, body: OutcomeComplete, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Outcome).join(Project).where(
            Outcome.id == outcome_id, Outcome.project_id == project_id, Project.owner_id == current_user.id))
    outcome = result.scalar_one_or_none()
    if not outcome:
        raise HTTPException(status_code=404, detail="Outcome not found")
    outcome.actual_ending_cash = body.actual_ending_cash
    outcome.total_spent = body.total_spent
    outcome.total_received = body.total_received
    outcome.net_result = body.actual_ending_cash - outcome.starting_capital
    outcome.summary = body.summary
    outcome.lessons = body.lessons
    outcome.status = "completed"
    outcome.completed_at = datetime.now(timezone.utc)
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one()
    project.status = "completed"
    await db.flush()
    await db.refresh(outcome)
    return outcome


@router.get("/projects/{project_id}/outcomes", response_model=List[OutcomeRead])
async def list_outcomes(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    result = await db.execute(select(Outcome).where(Outcome.project_id == project_id).order_by(Outcome.created_at.desc()))
    return result.scalars().all()


@router.get("/projects/{project_id}/report")
async def get_report(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).options(selectinload(Project.configurations))
        .where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    confirmed = [c for c in project.configurations if c.status == "confirmed"]
    config_dict = {}
    if confirmed:
        c = confirmed[0]
        config_dict = {"starting_capital": float(c.starting_capital), "target_ending_cash": float(c.target_ending_cash),
                       "currency": c.currency, "location": c.location, "risk_limits": c.risk_limits or {}}
    result = await db.execute(select(Approval).where(Approval.project_id == project_id).order_by(Approval.created_at.desc()))
    approvals = result.scalars().all()
    approval = approvals[0] if approvals else None
    recommendation = approval.strategy_snapshot if approval else None
    result = await db.execute(select(ExecutionAction).where(ExecutionAction.project_id == project_id))
    actions = result.scalars().all()
    result = await db.execute(select(Outcome).where(Outcome.project_id == project_id).order_by(Outcome.created_at.desc()))
    outcomes = result.scalars().all()
    outcome = outcomes[0] if outcomes else None

    def serialize(obj):
        if obj is None:
            return None
        d = {}
        for col in obj.__table__.columns:
            val = getattr(obj, col.name)
            if isinstance(val, Decimal):
                val = float(val)
            elif isinstance(val, datetime):
                val = val.isoformat()
            d[col.name] = val
        return d

    return generate_report(
        project_name=project.name, project_id=project.id, configuration=config_dict,
        recommendation=recommendation, approval=serialize(approval),
        actions=[serialize(a) for a in actions], outcome=serialize(outcome))
