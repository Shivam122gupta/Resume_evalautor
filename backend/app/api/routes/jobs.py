"""
jobs.py — Job description analysis endpoint.

POST /api/jobs/analyze
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.job_service import analyze_job_description

logger = logging.getLogger(__name__)
router = APIRouter()


class JobAnalyzeRequest(BaseModel):
    job_description: str


@router.post("/jobs/analyze")
async def analyze_job(request: JobAnalyzeRequest) -> dict:
    """
    Parse a raw job description text into a structured format.

    Uses the preserved parse_job_description() function from existing_logic.
    """
    if not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty")

    try:
        job = analyze_job_description(request.job_description)
        return job.model_dump()
    except RuntimeError as exc:
        logger.error("Job analysis failed: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error("Unexpected error in job analysis: %s", exc)
        raise HTTPException(status_code=500, detail="Internal processing error")
