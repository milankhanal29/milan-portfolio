"""Checklist router."""

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import async_session
from app.models.checklist import Checklist as ChecklistModel
from app.schemas.checklist import Checklist, ChecklistCreate, ChecklistUpdate
from app.dependencies import get_current_user

router = APIRouter(prefix="/checklist", tags=["Checklist"])


async def get_db():
    async with async_session() as session:
        yield session


@router.get("/", response_model=List[Checklist])
async def get_checklists(db: AsyncSession = Depends(get_db)):
    """Fetch all checklists."""
    result = await db.execute(select(ChecklistModel).order_by(ChecklistModel.created_at))
    return result.scalars().all()


@router.get("/{checklist_id}", response_model=Checklist)
async def get_checklist(checklist_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Fetch a specific checklist."""
    result = await db.execute(select(ChecklistModel).where(ChecklistModel.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    return checklist


@router.post("/", response_model=Checklist, status_code=status.HTTP_201_CREATED)
async def create_checklist(
    checklist_in: ChecklistCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Create a new checklist."""
    checklist = ChecklistModel(**checklist_in.model_dump())
    db.add(checklist)
    await db.commit()
    await db.refresh(checklist)
    return checklist


@router.put("/{checklist_id}", response_model=Checklist)
async def update_checklist(
    checklist_id: uuid.UUID,
    checklist_in: ChecklistUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Update a checklist."""
    result = await db.execute(select(ChecklistModel).where(ChecklistModel.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")

    update_data = checklist_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(checklist, key, value)

    await db.commit()
    await db.refresh(checklist)
    return checklist


@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checklist(
    checklist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Delete a checklist."""
    result = await db.execute(select(ChecklistModel).where(ChecklistModel.id == checklist_id))
    checklist = result.scalar_one_or_none()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")

    await db.delete(checklist)
    await db.commit()
    return None
