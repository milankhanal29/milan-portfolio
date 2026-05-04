"""CRUD service for experiences, projects, blog posts, skills, testimonials, site settings, contacts."""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, Type, TypeVar

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base

T = TypeVar("T", bound=Base)


# ==================== Generic CRUD ====================

async def get_all(db: AsyncSession, model: Type[T], order_by=None, filters: dict = None) -> List[T]:
    """Get all records of a model, optionally ordered and filtered."""
    stmt = select(model)
    if filters:
        for key, value in filters.items():
            stmt = stmt.where(getattr(model, key) == value)
    if order_by is not None:
        stmt = stmt.order_by(order_by)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, model: Type[T], record_id: str) -> Optional[T]:
    """Get a single record by UUID id."""
    result = await db.execute(select(model).where(model.id == uuid.UUID(record_id)))
    return result.scalar_one_or_none()


async def create_record(db: AsyncSession, model: Type[T], data: dict) -> T:
    """Create a new record."""
    record = model(**data)
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


async def update_record(db: AsyncSession, model: Type[T], record_id: str, data: dict) -> Optional[T]:
    """Update an existing record by UUID id."""
    record = await get_by_id(db, model, record_id)
    if not record:
        return None
    for key, value in data.items():
        setattr(record, key, value)
    await db.commit()
    await db.refresh(record)
    return record


async def delete_record(db: AsyncSession, model: Type[T], record_id: str) -> bool:
    """Delete a record by UUID id. Returns True if deleted."""
    record = await get_by_id(db, model, record_id)
    if not record:
        return False
    await db.delete(record)
    await db.commit()
    return True


# ==================== Blog-specific ====================

from app.models.blog import BlogPost


async def get_blog_by_slug(db: AsyncSession, slug: str) -> Optional[BlogPost]:
    """Get a blog post by its slug."""
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    return result.scalar_one_or_none()


async def increment_blog_views(db: AsyncSession, slug: str) -> Optional[BlogPost]:
    """Increment the view count of a blog post."""
    post = await get_blog_by_slug(db, slug)
    if post:
        post.views += 1
        await db.commit()
        await db.refresh(post)
    return post


async def publish_blog_post(db: AsyncSession, record_id: str) -> Optional[BlogPost]:
    """Publish a blog post by setting is_published and published_at."""
    post = await get_by_id(db, BlogPost, record_id)
    if post:
        post.is_published = True
        post.published_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(post)
    return post


# ==================== SiteSettings (singleton) ====================

from app.models.site_settings import SiteSettings


async def get_site_settings(db: AsyncSession) -> SiteSettings:
    """Get or create the singleton site settings."""
    result = await db.execute(select(SiteSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = SiteSettings()
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


async def update_site_settings(db: AsyncSession, data: dict) -> SiteSettings:
    """Update site settings."""
    settings = await get_site_settings(db)
    for key, value in data.items():
        setattr(settings, key, value)
    await db.commit()
    await db.refresh(settings)
    return settings


# ==================== Contact Messages ====================

from app.models.contact import ContactMessage


async def mark_message_read(db: AsyncSession, message_id: str) -> Optional[ContactMessage]:
    """Mark a contact message as read."""
    msg = await get_by_id(db, ContactMessage, message_id)
    if msg:
        msg.is_read = True
        await db.commit()
        await db.refresh(msg)
    return msg
