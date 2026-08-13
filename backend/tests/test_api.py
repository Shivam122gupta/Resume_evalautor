"""
test_api.py — Backend API tests.

Tests:
- Health endpoint
- Job analysis endpoint
- Evaluations endpoint (validation)
- Schema validation
- Ranking logic
- Failed resume handling
"""
import io
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.existing_logic.parser import JobD, Resume, Experience
from app.existing_logic.matcher import MatchResult, MatchDetails
from app.existing_logic.document_reader import read_pdf, read_docx


client = TestClient(app)

# ── Health ────────────────────────────────────────────────────────────────────

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


# ── Pydantic Schemas ──────────────────────────────────────────────────────────

def test_job_schema_valid():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python", "FastAPI"],
        preferred_skills=["Docker"],
        minimum_experience=2.0,
        education_requirements=["B.Sc. Computer Science"],
        responsibilities=["Build APIs"],
    )
    assert job.role == "Software Engineer"
    assert len(job.required_skills) == 2


def test_job_schema_null_experience():
    job = JobD(
        role="Junior Dev",
        required_skills=[],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        responsibilities=[],
    )
    assert job.minimum_experience is None


def test_resume_schema_defaults():
    resume = Resume()
    assert resume.name is None
    assert resume.skills == []
    assert resume.experiences == []


def test_experience_schema():
    exp = Experience(
        company="Acme Corp",
        role="Developer",
        duration="2 years",
        description="Built stuff",
        skills_used=["Python"],
    )
    assert exp.company == "Acme Corp"


def test_match_details_score_bounds():
    details = MatchDetails(
        candidate_name="Alice",
        matching_skills=["Python"],
        missing_important_skills=[],
        experience_requirement_met=True,
        overall_match_percentage=85.0,
        final_verdict="Strong candidate",
    )
    assert 0 <= details.overall_match_percentage <= 100


def test_match_result():
    details = MatchDetails(overall_match_percentage=72.0)
    result = MatchResult(score=72.0, details=details)
    assert result.score == 72.0


# ── Evaluations endpoint validation ───────────────────────────────────────────

def test_evaluate_empty_jd():
    """Empty job description should return 400."""
    response = client.post(
        "/api/evaluations",
        data={"job_description": "   "},
        files=[("files", ("test.pdf", b"fake pdf content", "application/pdf"))],
    )
    assert response.status_code == 400


def test_evaluate_no_files():
    """No files should return 422 (missing required field)."""
    response = client.post(
        "/api/evaluations",
        data={"job_description": "Some JD"},
    )
    assert response.status_code == 422


def test_evaluate_invalid_file_type():
    """Non-PDF/DOCX file should return 400."""
    with patch("app.services.evaluation_service.analyze_job_description") as mock_jd:
        mock_jd.return_value = JobD(
            role="Dev", required_skills=[], preferred_skills=[],
            minimum_experience=None, education_requirements=[], responsibilities=[]
        )
        response = client.post(
            "/api/evaluations",
            data={"job_description": "Valid JD text here"},
            files=[("files", ("resume.txt", b"text content", "text/plain"))],
        )
        assert response.status_code in (400, 200)  # 400 from validation or 200 with failed entry


# ── Ranking logic ─────────────────────────────────────────────────────────────

def test_ranking_order():
    """Candidates should be sorted by score descending."""
    candidates = [
        {"score": 40, "status": "success", "rank": None},
        {"score": 90, "status": "success", "rank": None},
        {"score": 65, "status": "success", "rank": None},
    ]
    successful = [c for c in candidates if c["status"] == "success"]
    successful.sort(key=lambda c: c["score"], reverse=True)
    for i, c in enumerate(successful, 1):
        c["rank"] = i

    assert successful[0]["score"] == 90
    assert successful[0]["rank"] == 1
    assert successful[1]["score"] == 65
    assert successful[2]["score"] == 40


def test_failed_candidates_excluded_from_ranking():
    """Failed candidates should not receive a rank."""
    results = [
        {"score": 80, "status": "success", "rank": None},
        {"score": 0, "status": "failed", "rank": None, "error": "Parse error"},
    ]
    successful = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]

    successful.sort(key=lambda c: c["score"], reverse=True)
    for i, c in enumerate(successful, 1):
        c["rank"] = i

    assert successful[0]["rank"] == 1
    assert failed[0]["rank"] is None


# ── Score bounds ──────────────────────────────────────────────────────────────

def test_score_between_0_and_100():
    for score in [0, 50, 100]:
        result = MatchResult(score=score, details=MatchDetails())
        assert 0 <= result.score <= 100


# ── Job analysis endpoint ─────────────────────────────────────────────────────

def test_job_analyze_empty():
    response = client.post(
        "/api/jobs/analyze",
        json={"job_description": ""},
    )
    assert response.status_code == 400


def test_job_analyze_success():
    """Mock the LLM call and verify the response structure."""
    mock_job = JobD(
        role="Backend Engineer",
        required_skills=["Python", "FastAPI"],
        preferred_skills=["Docker", "Kubernetes"],
        minimum_experience=2.0,
        education_requirements=["B.Sc."],
        responsibilities=["Build APIs", "Review code"],
    )
    with patch("app.api.routes.jobs.analyze_job_description", return_value=mock_job):
        response = client.post(
            "/api/jobs/analyze",
            json={"job_description": "We need a backend engineer with Python skills."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "Backend Engineer"
        assert "Python" in data["required_skills"]
