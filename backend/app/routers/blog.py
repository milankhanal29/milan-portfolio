"""Blog/Suggestions router — public list/detail and admin CRUD."""

from typing import List
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.blog import BlogPost
from app.models.user import User
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse, BlogPostListResponse
from app.services.crud_service import (
    get_all, get_by_id, create_record, update_record, delete_record,
    get_blog_by_slug, increment_blog_views,
)
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/blog", tags=["Blog"])


@router.get("", response_model=List[BlogPostListResponse])
async def list_posts(
    all_posts: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Get published blog posts. Pass all_posts=true for admin to see drafts."""
    cache_key = f"blog:list:{all_posts}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    stmt = select(BlogPost).order_by(BlogPost.created_at.desc())
    if not all_posts:
        stmt = stmt.where(BlogPost.is_published == True)

    result = await db.execute(stmt)
    items = result.scalars().all()

    response = []
    for item in items:
        data = BlogPostListResponse(
            id=str(item.id),
            title=item.title,
            slug=item.slug,
            tags=item.tags or [],
            published_at=item.published_at,
            cover_image=item.cover_image,
            is_published=item.is_published,
            views=item.views,
            reading_time=item.reading_time,
            created_at=item.created_at,
        ).model_dump(mode="json")
        response.append(data)

    await cache_set(cache_key, json.dumps(response, default=str))
    return response


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    """Get a single blog post by slug and increment view count."""
    post = await increment_blog_views(db, slug)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return BlogPostResponse(
        id=str(post.id),
        title=post.title,
        slug=post.slug,
        body=post.body,
        tags=post.tags or [],
        published_at=post.published_at,
        cover_image=post.cover_image,
        is_published=post.is_published,
        views=post.views,
        reading_time=post.reading_time,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.post("", response_model=BlogPostResponse, status_code=201)
async def create_post(
    data: BlogPostCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Create a new blog post (admin only)."""
    post_data = data.model_dump()
    if data.is_published:
        post_data["published_at"] = datetime.now(timezone.utc)

    item = await create_record(db, BlogPost, post_data)
    await cache_invalidate_prefix("blog")

    return BlogPostResponse(
        id=str(item.id),
        title=item.title,
        slug=item.slug,
        body=item.body,
        tags=item.tags or [],
        published_at=item.published_at,
        cover_image=item.cover_image,
        is_published=item.is_published,
        views=item.views,
        reading_time=item.reading_time,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.put("/{item_id}", response_model=BlogPostResponse)
async def update_post(
    item_id: str,
    data: BlogPostUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update a blog post (admin only)."""
    update_data = data.model_dump(exclude_unset=True)
    if data.is_published:
        # Set published_at if publishing for the first time
        existing = await get_by_id(db, BlogPost, item_id)
        if existing and not existing.is_published:
            update_data["published_at"] = datetime.now(timezone.utc)

    item = await update_record(db, BlogPost, item_id, update_data)
    if not item:
        raise HTTPException(status_code=404, detail="Post not found")
    await cache_invalidate_prefix("blog")

    return BlogPostResponse(
        id=str(item.id),
        title=item.title,
        slug=item.slug,
        body=item.body,
        tags=item.tags or [],
        published_at=item.published_at,
        cover_image=item.cover_image,
        is_published=item.is_published,
        views=item.views,
        reading_time=item.reading_time,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.delete("/{item_id}", status_code=204)
async def delete_post(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Delete a blog post (admin only)."""
    deleted = await delete_record(db, BlogPost, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    await cache_invalidate_prefix("blog")
