"""Experience router — public list and admin CRUD."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.experience import Experience
from app.models.user import User
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.services.crud_service import get_all, get_by_id, create_record, update_record, delete_record
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/experiences", tags=["Experiences"])


@router.get("", response_model=List[ExperienceResponse])
async def list_experiences(db: AsyncSession = Depends(get_db)):
    """Get all experiences ordered by start_date descending."""
    cached = await cache_get("experiences:all")
    if cached:
        return json.loads(cached)

    items = await get_all(db, Experience, order_by=Experience.start_date.desc())
    response = [ExperienceResponse.model_validate(i, from_attributes=True).model_dump(mode="json") for i in items]
    await cache_set("experiences:all", json.dumps(response, default=str))
    return response


@router.post("", response_model=ExperienceResponse, status_code=201)
async def create_experience(
    data: ExperienceCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new experience (admin only)."""
    item = await create_record(db, Experience, data.model_dump())
    await cache_invalidate_prefix("experiences")
    return ExperienceResponse.model_validate(item, from_attributes=True)


@router.put("/{item_id}", response_model=ExperienceResponse)
async def update_experience(
    item_id: str,
    data: ExperienceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update an experience (admin only)."""
    item = await update_record(db, Experience, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Experience not found")
    await cache_invalidate_prefix("experiences")
    return ExperienceResponse.model_validate(item, from_attributes=True)


@router.delete("/{item_id}", status_code=204)
async def delete_experience(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete an experience (admin only)."""
    deleted = await delete_record(db, Experience, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Experience not found")
    await cache_invalidate_prefix("experiences")
