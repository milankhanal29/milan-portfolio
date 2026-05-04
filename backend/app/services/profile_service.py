"""Profile service."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import Profile
from app.schemas.profile import ProfileUpdate


async def get_profile(db: AsyncSession) -> Profile | None:
    """Get the single profile record."""
    result = await db.execute(select(Profile).limit(1))
    return result.scalar_one_or_none()


async def update_profile(db: AsyncSession, data: ProfileUpdate) -> Profile:
    """Update the profile. Creates one if none exists."""
    profile = await get_profile(db)
    if not profile:
        profile = Profile()
        db.add(profile)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile
