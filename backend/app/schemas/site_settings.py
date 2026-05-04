"""SiteSettings schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SiteSettingsUpdate(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    og_image: Optional[str] = None
    favicon: Optional[str] = None
    accent_color: Optional[str] = None
    maintenance_mode: Optional[bool] = None


class SiteSettingsResponse(BaseModel):
    id: str
    meta_title: str
    meta_description: str
    og_image: Optional[str] = None
    favicon: Optional[str] = None
    accent_color: str
    maintenance_mode: bool
    updated_at: datetime

    class Config:
        from_attributes = True
