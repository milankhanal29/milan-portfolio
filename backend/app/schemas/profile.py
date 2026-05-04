"""Profile schemas."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    tagline: Optional[str] = None
    social_links: Optional[dict] = None
    resume_url: Optional[str] = None
    location: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[date] = None


class ProfileResponse(BaseModel):
    id: str
    name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    tagline: Optional[str] = None
    social_links: dict = {}
    resume_url: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
