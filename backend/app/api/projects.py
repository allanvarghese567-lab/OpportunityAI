from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.models.project import Configuration, Project
from app.schemas.project import (
    ConfigurationCreate,
    ConfigurationRead,
    ConfigurationUpdate,
    ProjectCreate,
    ProjectListItem,
    ProjectRead,
    ProjectUpdate,
)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[ProjectListItem])
async def list_projects(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project)
        .where(Project.owner_id == current_user.id)
        .order_by(Project.updated_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(project_in: ProjectCreate, db: DbSession, current_user: CurrentUser):
    project = Project(
        owner_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
        status="draft",
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)
    return project


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project)
        .options(selectinload(Project.configurations))
        .where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    project_in: ProjectUpdate,
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

    for field, value in project_in.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    await db.flush()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)


@router.post(
    "/{project_id}/configurations",
    response_model=ConfigurationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_configuration(
    project_id: int,
    config_in: ConfigurationCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    config = Configuration(project_id=project_id, status="draft", **config_in.model_dump())
    db.add(config)
    await db.flush()
    await db.refresh(config)
    return config


@router.get("/{project_id}/configurations", response_model=List[ConfigurationRead])
async def list_configurations(project_id: int, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.owner_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(
        select(Configuration)
        .where(Configuration.project_id == project_id)
        .order_by(Configuration.created_at.desc())
    )
    return result.scalars().all()


@router.post("/{project_id}/configurations/{config_id}/confirm", response_model=ConfigurationRead)
async def confirm_configuration(
    project_id: int,
    config_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    result = await db.execute(
        select(Configuration)
        .join(Project)
        .where(
            Configuration.id == config_id,
            Configuration.project_id == project_id,
            Project.owner_id == current_user.id,
        )
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    if config.status == "confirmed":
        raise HTTPException(status_code=400, detail="Configuration already confirmed")

    config.status = "confirmed"
    config.confirmed_at = datetime.now(timezone.utc)

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one()
    project.status = "configured"

    await db.flush()
    await db.refresh(config)
    return config
