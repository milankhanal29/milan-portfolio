"""Authentication router — login, refresh, logout, me."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import authenticate_user, create_tokens
from app.utils.security import decode_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user and return JWT tokens in httpOnly cookies."""
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    tokens = await create_tokens(user)

    # Set httpOnly cookies
    cookie_settings = {
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": "lax" if settings.DEBUG else "none",
        "path": "/",
    }

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_settings
    )
    
    # Refresh token cookie should be limited to /auth/refresh
    refresh_cookie_settings = cookie_settings.copy()
    refresh_cookie_settings["path"] = "/api/v1/auth/refresh"

    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        **refresh_cookie_settings
    )

    return TokenResponse(access_token=tokens["access_token"])


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(None),
):
    """Refresh the access token using the refresh token from cookie."""
    # Note: refresh_token comes from cookie path /auth/refresh
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    from sqlalchemy import select
    import uuid
    result = await db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    tokens = await create_tokens(user)

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax" if settings.DEBUG else "none",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return TokenResponse(access_token=tokens["access_token"])


@router.post("/logout")
async def logout(response: Response):
    """Clear authentication cookies."""
    response.delete_cookie(
        "access_token", 
        path="/",
        secure=not settings.DEBUG,
        samesite="lax" if settings.DEBUG else "none",
    )
    response.delete_cookie(
        "refresh_token", 
        path="/api/v1/auth/refresh",
        secure=not settings.DEBUG,
        samesite="lax" if settings.DEBUG else "none",
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        is_admin=current_user.is_admin,
    )
