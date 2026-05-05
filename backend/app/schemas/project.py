"""Project schemas."""

from datetime import datetime
from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    tech_stack: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image: Optional[str] = None
    featured: bool = False
    order: int = 0


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image: Optional[str] = None
    featured: Optional[bool] = None
    order: Optional[int] = None


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    tech_stack: List[str] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image: Optional[str] = None
    featured: bool
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
