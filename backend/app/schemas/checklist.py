"""Pydantic schemas for Checklist."""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class ChecklistBase(BaseModel):
    title: str = Field(..., max_length=255)
    data: Dict[str, Any] = Field(...)


class ChecklistCreate(ChecklistBase):
    pass


class ChecklistUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    data: Optional[Dict[str, Any]] = None


class Checklist(ChecklistBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
