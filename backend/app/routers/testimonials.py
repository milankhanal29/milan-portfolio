"""Testimonials router — public featured list and admin CRUD."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.testimonial import Testimonial
from app.models.user import User
from app.schemas.testimonial import TestimonialCreate, TestimonialUpdate, TestimonialResponse
from app.services.crud_service import get_all, create_record, update_record, delete_record
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])


@router.get("", response_model=List[TestimonialResponse])
async def list_testimonials(
    featured_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get testimonials. By default only featured ones."""
    cache_key = f"testimonials:{featured_only}"
    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    filters = {"is_featured": True} if featured_only else None
    items = await get_all(db, Testimonial, order_by=Testimonial.order, filters=filters)
    response = [TestimonialResponse.model_validate(i, from_attributes=True).model_dump(mode="json") for i in items]
    await cache_set(cache_key, json.dumps(response, default=str))
    return response


@router.post("", response_model=TestimonialResponse, status_code=201)
async def create_testimonial(
    data: TestimonialCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await create_record(db, Testimonial, data.model_dump())
    await cache_invalidate_prefix("testimonials")
    return TestimonialResponse.model_validate(item, from_attributes=True)


@router.put("/{item_id}", response_model=TestimonialResponse)
async def update_testimonial(
    item_id: str,
    data: TestimonialUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = await update_record(db, Testimonial, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await cache_invalidate_prefix("testimonials")
    return TestimonialResponse.model_validate(item, from_attributes=True)


@router.delete("/{item_id}", status_code=204)
async def delete_testimonial(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    deleted = await delete_record(db, Testimonial, item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await cache_invalidate_prefix("testimonials")
