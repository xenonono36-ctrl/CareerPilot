"""CareerPilot Backend Application."""
from pathlib import Path
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
        print("[OK] Database connected and tables initialized")
    except Exception as e:
        # Use ASCII-only output so the boot doesn't crash on Windows cp1252
        # consoles (raises UnicodeEncodeError on ✓/⚠ glyphs).
        print(f"[WARN] Database not available: {e}")
        print("        App will run without database connection")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="CareerPilot API",
    description="AI-powered career co-pilot backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware — env-driven allow-list (comma-separated origins) PLUS a
# regex that covers all Vercel preview / branch deploys. FastAPI's
# `allow_origins` does exact string match only — `*.vercel.app` written as
# a literal string is a no-op, so we use `allow_origin_regex` for the
# pattern. Production and local dev still go through the explicit list so
# the common case stays auditable.
#
# Env vars:
#   FRONTEND_URL      single origin (back-compat) or comma-separated list
#   FRONTEND_URLS     comma-separated list (takes precedence if both set)
#
# Examples:
#   FRONTEND_URL=http://localhost:3000,https://careerpilot.vercel.app
#   FRONTEND_URLS=https://careerpilot-custom.com,https://staging.example.com

_default_origins = (
    
    "http://localhost:3000,"
    "https://careerpilot.vercel.app"
    
)
_raw_origins = settings.frontend_url or _default_origins
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
_allowed_origins = [o for o in _allowed_origins if "*" not in o]  # drop dead wildcards

# Regex covers: production + Vercel preview + Vercel branch deploys.
# Anchored, case-insensitive on scheme/host.
_vercel_origin_regex = r"^https://careerpilot(-[a-z0-9][a-z0-9-]*)?\.vercel\.app$"

# Optional extra regex from env for custom multi-tenant setups.
_extra_regex = getattr(settings, "frontend_origin_regex", None) or None

# If the operator put `*` in env, reflect that explicitly (escape hatch).
_allow_all = "*" in _allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all else _allowed_origins,
    allow_origin_regex=_extra_regex or _vercel_origin_regex,
    allow_credentials=not _allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
    max_age=600,
)

# Static files for uploads — directory is created on first upload; create it
# here so the server can boot even on a fresh deploy with no uploads yet.
_uploads_dir = Path("uploads")
_uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")

# Include routers
app.include_router(cv.router, prefix="/api/cv", tags=["CV"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])


@app.get("/api/health")
@app.get("/api/v1/health")  # alias used by Railway/Render healthcheck
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "app": "CareerPilot"}
