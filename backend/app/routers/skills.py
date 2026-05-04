"""Skills router — public grouped list and admin CRUD."""

from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.skill import Skill
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from app.services.crud_service import get_all, create_record, update_record, delete_record
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=Dict[str, List[SkillResponse]])
async def list_skills(db: AsyncSession = Depends(get_db)):
    """Get all skills grouped by category."""
    cached = await cache_get("skills:grouped")
    if cached:
        return json.loads(cached)

    items = await get_all(db, Skill, order_by=Skill.order)
    grouped: Dict[str, list] = {}
    for item in items:
        cat = item.category
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(
            SkillResponse.model_validate(item, from_attributes=True).model_dump(mode="json")
        )

    await cache_set("skills:grouped", json.dumps(grouped, default=str))
    return grouped


@router.get("/flat", response_model=List[SkillResponse])
async def list_skills_flat(db: AsyncSession = Depends(get_db)):
    """Get all skills as a flat list (for admin)."""
    items = await get_all(db, Skill, order_by=Skill.order)
    return [SkillResponse.model_validate(i, from_attributes=True) for i in items]


@router.post("", response_model=SkillResponse, status_code=201)
async def create_skill(
    data: SkillCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new skill (admin only)."""
    item = await create_record(db, Skill, data.model_dump())
    await cache_invalidate_prefix("skills")
    return SkillResponse.model_validate(item, from_attributes=True)


@router.put("/{item_id}", response_model=SkillResponse)
async def update_skill(
    item_id: str,
    data: SkillUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a skill (admin only)."""
    item = await update_record(db, Skill, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Skill not found")
    await cache_invalidate_prefix("skills")
    return SkillResponse.model_validate(item, from_attributes=True)


@router.delete("/{item_id}", status_code=204)
async def delete_skill(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a skill (admin only)."""
    deleted = await delete_record(db, Skill, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Skill not found")
    await cache_invalidate_prefix("skills")
