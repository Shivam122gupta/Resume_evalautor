"""
health.py — Health check endpoint.

GET /api/health → {"status": "ok"}
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}
