"""Projects router — public list and admin CRUD."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.crud_service import get_all, get_by_id, create_record, update_record, delete_record
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    tech: Optional[str] = Query(None, description="Filter by tech stack"),
    db: AsyncSession = Depends(get_db),
):
    """Get all projects, featured first. Optionally filter by tech."""
    cache_key = f"projects:all:{tech or 'none'}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    stmt = select(Project).order_by(Project.featured.desc(), Project.order, Project.created_at.desc())
    if tech:
        stmt = stmt.where(Project.tech_stack.any(tech))
    result = await db.execute(stmt)
    items = result.scalars().all()

    response = [ProjectResponse.model_validate(i, from_attributes=True).model_dump(mode="json") for i in items]
    await cache_set(cache_key, json.dumps(response, default=str))
    return response


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new project (admin only)."""
    item = await create_record(db, Project, data.model_dump())
    await cache_invalidate_prefix("projects")
    return ProjectResponse.model_validate(item, from_attributes=True)


@router.put("/{item_id}", response_model=ProjectResponse)
async def update_project(
    item_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a project (admin only)."""
    item = await update_record(db, Project, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    await cache_invalidate_prefix("projects")
    return ProjectResponse.model_validate(item, from_attributes=True)


@router.delete("/{item_id}", status_code=204)
async def delete_project(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a project (admin only)."""
    deleted = await delete_record(db, Project, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    await cache_invalidate_prefix("projects")
