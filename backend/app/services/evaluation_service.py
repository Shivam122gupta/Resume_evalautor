"""
evaluation_service.py — Main orchestration pipeline.

Implements the full pipeline:
  Job Description → parse → structured JobD
  For each resume:
    extract text → parse resume → match → score
  Sort by score DESC
  Return ranked results

Uses EXISTING business logic — does NOT duplicate anything.
Failed resumes are caught per-file so the batch continues.
"""
import logging
import time
from typing import Any

from fastapi import UploadFile

from app.existing_logic.parser import parse_resume, JobD
from app.existing_logic.matcher import final_score
from app.services.job_service import analyze_job_description
from app.services.resume_service import validate_upload, extract_text_from_upload
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


async def run_evaluation(
    job_description: str, files: list[UploadFile]
) -> dict[str, Any]:
    """
    Full evaluation pipeline.

    Returns:
        {
            "job": { ...structured job dict... },
            "results": [ ...ranked + failed candidates... ]
        }
    """
    start = time.time()
    logger.info(
        "Evaluation started | files=%d | jd_len=%d", len(files), len(job_description)
    )

    # ── Step 1: Parse the job description ────────────────────────────────────
    job: JobD = analyze_job_description(job_description)
    client = llm_service.get_raw_client()
    model = llm_service.model

    # ── Step 2: Process each resume ───────────────────────────────────────────
    all_results: list[dict[str, Any]] = []

    for file in files:
        file_start = time.time()
        logger.info("Processing resume: %s", file.filename)

        try:
            # Validate file type
            validate_upload(file)

            # Extract text (preserved read_resume logic)
            resume_text = await extract_text_from_upload(file)

            # Parse resume (preserved parse_resume logic)
            parsed_resume = parse_resume(resume_text, client, model)

            # Score (preserved final_score logic)
            match_result = final_score(job, parsed_resume, client, model)

            elapsed = round(time.time() - file_start, 2)
            logger.info(
                "Resume processed | file=%s | score=%.1f | time=%.2fs",
                file.filename,
                match_result.score,
                elapsed,
            )

            all_results.append(
                {
                    "rank": None,  # will be set after sorting
                    "candidate_name": (
                        match_result.details.candidate_name
                        or parsed_resume.name
                        or "Unknown"
                    ),
                    "score": round(match_result.score, 1),
                    "file_name": file.filename,
                    "status": "success",
                    "details": {
                        "matching_skills": match_result.details.matching_skills,
                        "missing_important_skills": match_result.details.missing_important_skills,
                        "experience_requirement_met": match_result.details.experience_requirement_met,
                        "overall_match_percentage": match_result.details.overall_match_percentage,
                        "final_verdict": match_result.details.final_verdict,
                        # Extra fields from parsed resume for the frontend detail cards
                        "email": parsed_resume.email,
                        "phone": parsed_resume.phone,
                        "total_experience_years": parsed_resume.total_experience_years,
                        "education": parsed_resume.education,
                        "projects": parsed_resume.projects,
                        "certifications": parsed_resume.certifications,
                        "all_skills": parsed_resume.skills,
                    },
                }
            )

        except Exception as exc:
            elapsed = round(time.time() - file_start, 2)
            logger.error(
                "Resume failed | file=%s | error=%s | time=%.2fs",
                file.filename,
                exc,
                elapsed,
            )
            all_results.append(
                {
                    "rank": None,
                    "candidate_name": "Unknown",
                    "score": 0,
                    "file_name": file.filename,
                    "status": "failed",
                    "error": str(exc),
                    "details": None,
                }
            )

    # ── Step 3: Rank successful candidates ───────────────────────────────────
    successful = [r for r in all_results if r["status"] == "success"]
    failed = [r for r in all_results if r["status"] == "failed"]

    successful.sort(key=lambda c: c["score"], reverse=True)

    for i, candidate in enumerate(successful, start=1):
        candidate["rank"] = i

    total_elapsed = round(time.time() - start, 2)
    logger.info(
        "Evaluation complete | successful=%d | failed=%d | total_time=%.2fs",
        len(successful),
        len(failed),
        total_elapsed,
    )

    return {
        "job": job.model_dump(),
        "results": successful + failed,
        "summary": {
            "total": len(all_results),
            "successful": len(successful),
            "failed": len(failed),
            "average_score": (
                round(sum(r["score"] for r in successful) / len(successful), 1)
                if successful
                else 0
            ),
        },
    }
