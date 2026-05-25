"""Application configuration."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "CareerPilot"
    debug: bool = True

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/careerpilot"
    database_sync_url: str = "postgresql://postgres:postgres@localhost:5432/careerpilot"

    # Gemini AI
    gemini_api_key: str = ""

    # Clerk Auth
    clerk_secret_key: str = ""
    clerk_verify_token: str = ""

    # JSearch API
    jsearch_api_key: str = ""
    jsearch_host: str = "google-search-api1.p.rapidapi.com"

    # ChromaDB
    chroma_db_path: str = "./chroma_db"

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
