"""Testimonial schemas."""

from datetime import datetime
from uuid import UUID
from typing import Optional

from pydantic import BaseModel


class TestimonialCreate(BaseModel):
    author_name: str
    author_role: Optional[str] = None
    company: Optional[str] = None
    avatar: Optional[str] = None
    text: str
    is_featured: bool = False
    order: int = 0


class TestimonialUpdate(BaseModel):
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    company: Optional[str] = None
    avatar: Optional[str] = None
    text: Optional[str] = None
    is_featured: Optional[bool] = None
    order: Optional[int] = None


class TestimonialResponse(BaseModel):
    id: UUID
    author_name: str
    author_role: Optional[str] = None
    company: Optional[str] = None
    avatar: Optional[str] = None
    text: str
    is_featured: bool
    order: int
    created_at: datetime

    class Config:
        from_attributes = True
