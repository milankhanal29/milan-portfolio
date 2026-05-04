"""SiteSettings model for global site configuration."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meta_title: Mapped[str] = mapped_column(String(255), default="Milan Khanal — Portfolio")
    meta_description: Mapped[str] = mapped_column(
        String(500),
        default="Full-stack developer portfolio and personal site of Milan Khanal.",
    )
    og_image: Mapped[str] = mapped_column(String(500), nullable=True)
    favicon: Mapped[str] = mapped_column(String(500), nullable=True)
    accent_color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
