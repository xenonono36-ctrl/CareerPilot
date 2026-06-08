"""CareerPilot Backend Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import cv, jobs, chat, tasks, applications


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup - try to initialize DB but don't fail if unavailable
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✓ Database connected and tables initialized")
    except Exception as e:
        print(f"⚠ Database not available: {e}")
        print("  App will run without database connection")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="CareerPilot API",
    description="AI-powered career co-pilot backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — env-driven allow-list (comma-separated origins)
_default_origins = "http://localhost:3000,https://careerpilot.vercel.app"
_allowed_origins = [
    o.strip()
    for o in (settings.frontend_url or _default_origins).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(cv.router, prefix="/api/cv", tags=["CV"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": "CareerPilot"}
