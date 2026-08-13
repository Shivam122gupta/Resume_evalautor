"""
job_service.py — Orchestrates job description parsing.

Delegates to existing_logic.parser.parse_job_description (preserved code).
"""
import logging
from app.existing_logic.parser import parse_job_description, JobD
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


def analyze_job_description(job_description: str) -> JobD:
    """
    Parse job description text → structured JobD using the preserved LLM logic.
    """
    logger.info("Analyzing job description (%d chars)", len(job_description))
    client = llm_service.get_raw_client()
    model = llm_service.model
    job = parse_job_description(job_description, client, model)
    logger.info("Job analysis complete | role=%s", job.role)
    return job
