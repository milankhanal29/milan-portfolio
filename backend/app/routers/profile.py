"""Profile router — public get and admin update."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.profile_service import get_profile, update_profile
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileResponse)
async def get_public_profile(db: AsyncSession = Depends(get_db)):
    """Get the public profile data."""
    # Try cache
    cached = await cache_get("profile:data")
    if cached:
        return json.loads(cached)

    profile = await get_profile(db)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    response = ProfileResponse.model_validate(profile, from_attributes=True)
    response_dict = response.model_dump(mode="json")
    await cache_set("profile:data", json.dumps(response_dict, default=str))
    return response_dict


@router.put("", response_model=ProfileResponse)
async def update_profile_endpoint(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update the profile (admin only)."""
    profile = await update_profile(db, data)
    await cache_invalidate_prefix("profile")
    return ProfileResponse.model_validate(profile, from_attributes=True)
