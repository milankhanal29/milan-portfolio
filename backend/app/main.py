"""FastAPI application factory with lifespan, middleware, and router registration."""

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import init_db, close_db
from app.utils.cache import init_redis, close_redis
from app.services.auth_service import create_admin_user
from app.database import async_session


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    await init_redis()

    # Create admin user from env
    async with async_session() as db:
        await create_admin_user(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD)
        print(f"✅ Admin user ensured: {settings.ADMIN_EMAIL}")

        # Ensure seed data if profile or projects are missing
        from app.services.profile_service import get_profile
        from app.services.crud_service import get_all
        from app.models.project import Project
        
        profile = await get_profile(db)
        projects = await get_all(db, Project)
        
        if not profile or not projects:
            print("🌱 Missing data, seeding database...")
            from seed import seed as seed_db
            await seed_db()
            print("✅ Database seeded successfully")

    yield

    # Shutdown
    await close_redis()
    await close_db()
    print("👋 Application shutdown complete")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID and logging middleware
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()
        response = await call_next(request)
        duration = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        print(f"[{request_id}] {request.method} {request.url.path} → {response.status_code} ({duration}ms)")
        return response

    # Static files for local uploads
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # Register routers
    from app.routers import auth, profile, experiences, projects, blog, skills
    from app.routers import testimonials, site_settings, contact, birthday, upload

    api_prefix = "/api/v1"
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(profile.router, prefix=api_prefix)
    app.include_router(experiences.router, prefix=api_prefix)
    app.include_router(projects.router, prefix=api_prefix)
    app.include_router(blog.router, prefix=api_prefix)
    app.include_router(skills.router, prefix=api_prefix)
    app.include_router(testimonials.router, prefix=api_prefix)
    app.include_router(site_settings.router, prefix=api_prefix)
    app.include_router(contact.router, prefix=api_prefix)
    app.include_router(birthday.router, prefix=api_prefix)
    app.include_router(upload.router, prefix=api_prefix)

    # Health check
    @app.get("/health")
    async def health():
        return {"status": "healthy", "version": settings.APP_VERSION}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=settings.DEBUG)
