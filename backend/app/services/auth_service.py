"""Authentication service."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Authenticate a user by email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


async def create_tokens(user: User) -> dict:
    """Create access and refresh tokens for a user."""
    data = {"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
    }


async def create_admin_user(db: AsyncSession, email: str, password: str) -> User:
    """Create the initial admin user if it doesn't exist."""
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=hash_password(password),
        is_admin=True,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
