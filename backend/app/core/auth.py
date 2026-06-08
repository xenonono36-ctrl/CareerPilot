"""Clerk JWT verification dependency.

Validates the `Authorization: Bearer <token>` header from the frontend and
returns the Clerk user id (`sub` claim). Routes use this as a FastAPI
dependency to get the authenticated user — no more `demo_user` fallback.
"""
from __future__ import annotations

import logging
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Use Clerk's development instance issuer by default; production should set
# `CLERK_JWT_ISSUER` to the instance URL (e.g. https://clerk.your-domain.com)
_JWT_ISSUER = settings.clerk_jwt_issuer or "https://clerk.dev"
_JWKS_URL = f"{_JWT_ISSUER}/.well-known/jwks.json"

# Auto-attached Bearer header — optional so docs still render
_bearer_scheme = HTTPBearer(auto_error=False)

# Cache JWKS keys per process to avoid hitting Clerk on every request
_jwks_cache: Optional[dict] = None


async def _load_jwks() -> dict:
    """Fetch Clerk's JWKS (cached after first successful load)."""
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(_JWKS_URL)
            resp.raise_for_status()
            _jwks_cache = resp.json()
            return _jwks_cache
    except Exception as e:  # noqa: BLE001
        logger.warning("Failed to load Clerk JWKS from %s: %s", _JWKS_URL, e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth provider unavailable",
        ) from e


async def get_current_clerk_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """Verify the Clerk session token and return the user id (sub claim)."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        jwks = await _load_jwks()
        claims = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            issuer=_JWT_ISSUER,
            options={"verify_aud": False},  # Clerk tokens don't always include aud
        )
    except JWTError as e:
        logger.info("JWT verification failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    sub = claims.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim",
        )
    return sub
