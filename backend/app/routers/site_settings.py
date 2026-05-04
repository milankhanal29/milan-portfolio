"""Site settings router — public get and admin update."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.site_settings import SiteSettingsResponse, SiteSettingsUpdate
from app.services.crud_service import get_site_settings, update_site_settings
from app.utils.cache import cache_get, cache_set, cache_invalidate_prefix
import json

router = APIRouter(prefix="/settings", tags=["Site Settings"])


@router.get("", response_model=SiteSettingsResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Get public site settings."""
    cached = await cache_get("settings:data")
    if cached:
        return json.loads(cached)
    settings_obj = await get_site_settings(db)
    resp = SiteSettingsResponse.model_validate(settings_obj, from_attributes=True).model_dump(mode="json")
    await cache_set("settings:data", json.dumps(resp, default=str))
    return resp


@router.put("", response_model=SiteSettingsResponse)
async def update_settings(
    data: SiteSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update site settings (admin only)."""
    s = await update_site_settings(db, data.model_dump(exclude_unset=True))
    await cache_invalidate_prefix("settings")
    return SiteSettingsResponse.model_validate(s, from_attributes=True)
