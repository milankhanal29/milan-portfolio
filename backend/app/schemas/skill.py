"""Skill schemas."""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field


class SkillCreate(BaseModel):
    name: str
    category: str
    proficiency: int = Field(ge=1, le=5, default=3)
    icon_url: Optional[str] = None
    order: int = 0


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[int] = Field(ge=1, le=5, default=None)
    icon_url: Optional[str] = None
    order: Optional[int] = None


class SkillResponse(BaseModel):
    id: UUID
    name: str
    category: str
    proficiency: int
    icon_url: Optional[str] = None
    order: int
    created_at: datetime

    class Config:
        from_attributes = True
