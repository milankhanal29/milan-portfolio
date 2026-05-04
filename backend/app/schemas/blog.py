"""Blog/Suggestion schemas."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BlogPostCreate(BaseModel):
    title: str
    slug: str
    body: str
    tags: List[str] = []
    cover_image: Optional[str] = None
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[List[str]] = None
    cover_image: Optional[str] = None
    is_published: Optional[bool] = None


class BlogPostResponse(BaseModel):
    id: str
    title: str
    slug: str
    body: str
    tags: List[str] = []
    published_at: Optional[datetime] = None
    cover_image: Optional[str] = None
    is_published: bool
    views: int
    reading_time: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BlogPostListResponse(BaseModel):
    id: str
    title: str
    slug: str
    tags: List[str] = []
    published_at: Optional[datetime] = None
    cover_image: Optional[str] = None
    is_published: bool
    views: int
    reading_time: int
    created_at: datetime

    class Config:
        from_attributes = True
