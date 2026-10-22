"""Research run endpoints + SSE streaming."""

import asyncio
import json
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.agents.workflow import run_research_workflow
from app.api.deps import CurrentUser, DbSession
from app.models.project import Project

router = APIRouter(prefix="/research", tags=["research"])


@router.post("/projects/{project_id}/runs")
async def start_research_run(
    project_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.configurations))
        .where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    confirmed = [c for c in project.configurations if c.status == "confirmed"]
    if not confirmed:
        raise HTTPException(status_code=400, detail="No confirmed configuration found.")

    config = confirmed[0]
    project.status = "researching"
    await db.flush()

    return {
        "run_id": f"run-{project_id}",
        "project_id": project_id,
        "config_id": config.id,
        "status": "started",
        "stream_url": f"/api/v1/research/projects/{project_id}/stream",
    }


@router.get("/projects/{project_id}/stream")
async def stream_research(
    project_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.configurations))
        .where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    confirmed = [c for c in project.configurations if c.status == "confirmed"]
    if not confirmed:
        raise HTTPException(status_code=400, detail="No confirmed configuration")

    config = confirmed[0]
    config_dict: Dict[str, Any] = {
        "starting_capital": float(config.starting_capital),
        "target_ending_cash": float(config.target_ending_cash),
        "location": config.location,
        "currency": config.currency,
        "opportunity_preferences": config.opportunity_preferences or {},
        "resources": config.resources or {},
        "risk_limits": config.risk_limits or {},
        "priorities": config.priorities or {},
    }

    async def event_generator():
        try:
            async for event in run_research_workflow(config_dict):
                payload = json.dumps(event.to_dict())
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)
        except Exception as e:
            err = json.dumps({"agent": "workflow", "type": "error", "message": str(e)})
            yield f"data: {err}\n\n"
        finally:
            project.status = "configured"
            await db.flush()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
