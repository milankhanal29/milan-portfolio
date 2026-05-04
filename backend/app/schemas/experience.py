"""Experience schemas."""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel


class ExperienceCreate(BaseModel):
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    tech_stack: List[str] = []
    logo_url: Optional[str] = None
    is_current: bool = False
    order: int = 0


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    logo_url: Optional[str] = None
    is_current: Optional[bool] = None
    order: Optional[int] = None


class ExperienceResponse(BaseModel):
    id: str
    company: str
    role: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    tech_stack: List[str] = []
    logo_url: Optional[str] = None
    is_current: bool
    order: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
