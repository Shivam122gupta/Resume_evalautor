"""
evaluations.py — Core evaluation endpoint.

POST /api/evaluations
  - Accepts: job_description (form field) + multiple PDF/DOCX files
  - Returns: ranked candidates with match scores
"""
import logging
from fastapi import APIRouter, Form, UploadFile, File, HTTPException

from app.services.evaluation_service import run_evaluation
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/evaluations")
async def evaluate_resumes(
    job_description: str = Form(...),
    files: list[UploadFile] = File(...),
) -> dict:
    """
    Evaluate multiple resumes against a job description.

    Pipeline (uses preserved existing logic):
      1. Parse job description → JobD
      2. For each file: extract text → parse resume → match → score
      3. Rank successful candidates by score DESC
      4. Return all results (successful + failed)

    One failed resume does NOT stop the entire batch.
    """
    # ── Validation ────────────────────────────────────────────────────────────
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="job_description cannot be empty")

    if not files:
        raise HTTPException(status_code=400, detail="At least one resume file is required")

    if len(files) > settings.MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum {settings.MAX_FILES_PER_REQUEST} per request.",
        )

    logger.info(
        "Evaluation request received | files=%d | jd_preview=%s...",
        len(files),
        job_description[:80],
    )

    try:
        result = await run_evaluation(job_description, files)
        return result
    except RuntimeError as exc:
        logger.error("Evaluation pipeline failed: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        # DEV: log full traceback to backend terminal — never exposed to frontend
        logger.exception("Unexpected evaluation error — full traceback:")
        raise HTTPException(status_code=500, detail="Internal processing error")
