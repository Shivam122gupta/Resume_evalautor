"""
matcher.py
==========
PRESERVED FROM: resumeevaluation/resume_analyzer.py

Original class: MatchResult
Original function: final_score

The MatchResult.details dict is now normalized into a typed schema
to ensure consistent API responses (fixes the random key variation issue).

Token-budget fix (2025-08): Compact matching prompt that avoids dumping
the full JSON schema into the prompt. Sends only essential job fields.
Completion tokens reduced to 500 (JSON response is small).
"""
import json
import logging
from pydantic import BaseModel, Field
from .parser import JobD, Resume

logger = logging.getLogger(__name__)


class MatchDetails(BaseModel):
    """Normalized match details — fixes the random key issue from original code."""
    candidate_name: str | None = None
    matching_skills: list[str] = []
    missing_important_skills: list[str] = []
    experience_requirement_met: bool = False
    overall_match_percentage: float = Field(default=0.0, ge=0, le=100)
    final_verdict: str = ""


class MatchResult(BaseModel):
    """Preserved from resume_analyzer.py — score + structured details."""
    score: float = Field(ge=0, le=100)
    details: MatchDetails


def _compact_job_summary(job: JobD) -> str:
    """
    Serialize only the fields of JobD that the matcher needs, in a
    token-efficient way (no pretty-print indent, no redundant nesting).
    """
    return json.dumps({
        "role": job.role,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "minimum_experience": job.minimum_experience,
        "education_requirements": job.education_requirements,
    }, separators=(", ", ": "))


def _compact_resume_summary(resume: Resume) -> str:
    """
    Serialize only the fields of Resume that the matcher needs.
    Omits verbose experience descriptions to save tokens.
    """
    exp_list = []
    for e in resume.experiences:
        exp_list.append({
            "company": e.company,
            "role": e.role,
            "duration": e.duration,
            "skills_used": e.skills_used,
        })
    return json.dumps({
        "name": resume.name,
        "total_experience_years": resume.total_experience_years,
        "skills": resume.skills,
        "experiences": exp_list,
        "education": resume.education,
        "certifications": resume.certifications,
    }, separators=(", ", ": "))


def final_score(job: JobD, resume: Resume, groq_client, model: str) -> MatchResult:
    """
    Compare candidate resume against job description and return a scored result.
    Preserved logic from resume_analyzer.py — now with normalized details schema.
    Token-budget fix: compact prompt, no schema dump, reduced completion tokens.
    """
    job_summary = _compact_job_summary(job)
    resume_summary = _compact_resume_summary(resume)

    # Compact prompt — no verbose schema dump, no numbered instruction list.
    # The LLM returns a small JSON with exactly two keys.
    prompt = (
        f"You are an HR recruiter. Score how well the candidate matches the job.\n\n"
        f"JOB: {job_summary}\n\n"
        f"CANDIDATE: {resume_summary}\n\n"
        "Return ONLY valid JSON with exactly:\n"
        '  "score": float 0-100,\n'
        '  "details": {\n'
        '    "candidate_name": str,\n'
        '    "matching_skills": [list of skills candidate has that job requires],\n'
        '    "missing_important_skills": [required skills candidate lacks],\n'
        '    "experience_requirement_met": bool,\n'
        '    "overall_match_percentage": float 0-100,\n'
        '    "final_verdict": "1-2 sentence summary"\n'
        "  }\n"
        "No markdown, no code fences."
    )

    messages = [{"role": "user", "content": prompt}]

    from app.services.llm_service import llm_service
    data = llm_service.chat_json(
        messages=messages,
        max_completion_tokens=800,
        operation_name="final_score",
    )

    logger.info(
        "[DIAG] Match result — top-level keys=%s | types=%s",
        list(data.keys()),
        {k: type(v).__name__ for k, v in data.items()},
    )

    # Normalize — handle either flat or nested details key
    score_val = data.get("score", data.get("overall_match_percentage", 0))
    details_raw = data.get("details", data)

    logger.info(
        "[DIAG] Match details keys=%s | types=%s",
        list(details_raw.keys()) if isinstance(details_raw, dict) else type(details_raw).__name__,
        {k: type(v).__name__ for k, v in details_raw.items()} if isinstance(details_raw, dict) else {},
    )

    try:
        details = MatchDetails(
            candidate_name=details_raw.get("candidate_name") or resume.name,
            matching_skills=details_raw.get("matching_skills", []),
            missing_important_skills=details_raw.get("missing_important_skills", []),
            experience_requirement_met=bool(details_raw.get("experience_requirement_met", False)),
            overall_match_percentage=float(details_raw.get("overall_match_percentage", score_val)),
            final_verdict=details_raw.get("final_verdict", ""),
        )
        result = MatchResult(score=float(score_val), details=details)
        logger.info("[DIAG] MatchResult Pydantic validation PASSED | score=%.1f", result.score)
        return result
    except Exception as val_exc:
        logger.error("[DIAG] MatchResult Pydantic validation FAILED: %s", val_exc)
        raise
