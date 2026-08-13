"""
parser.py
=========
PRESERVED FROM: resumeevaluation/resume_analyzer.py

Original classes: JobD, Experience, Resume
Original functions: parse_resume, parse_job_description

These are the exact Pydantic schemas and LLM-parsing functions from the working
code, refactored into an importable module. No business logic has changed.

Token-budget fix (2025-08): Prompts trimmed and resume text capped to stay
well below the 8 000 TPM limit of openai/gpt-oss-120b.
"""
import json
import logging
import re
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ── Token-budget constants ────────────────────────────────────────────────────
# Rough heuristic: 1 token ≈ 4 chars of English text.
# Total request target: ~6 500 tokens → ~26 000 chars total.
# System prompt for parse_resume ≈ 350 chars → resume text budget ≈ 7 000 chars.
# System prompt for parse_job_description ≈ 350 chars → JD budget ≈ 6 000 chars.
_RESUME_TEXT_CHAR_LIMIT = 7_000   # ~1 750 tokens of resume text
_JD_TEXT_CHAR_LIMIT     = 6_000   # ~1 500 tokens of JD text


# ── Pydantic Models (preserved from resume_analyzer.py) ──────────────────────

class JobD(BaseModel):
    role: str
    required_skills: list[str]
    preferred_skills: list[str]
    minimum_experience: float | None
    education_requirements: list[str]
    responsibilities: list[str]


class Experience(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: str | None = None
    skills_used: list[str] = []


class Resume(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    total_experience_years: float | None = None
    skills: list[str] = []
    experiences: list[Experience] = []
    education: list[str] = []
    projects: list[str] = []
    certifications: list[str] = []


# ── Smart resume text limiter ─────────────────────────────────────────────────

# Priority order for resume sections — earlier = kept first when truncating.
_SECTION_PRIORITY = [
    r"(?i)(contact|personal|name|email|phone)",
    r"(?i)(education|qualification|degree|university|college)",
    r"(?i)(skill|technolog|proficienc|competenc)",
    r"(?i)(experience|employment|work history|professional|internship|intern)",
    r"(?i)(project)",
    r"(?i)(certification|certificate|award|achievement)",
    r"(?i)(summary|objective|profile|about)",
]


def _split_sections(text: str) -> list[tuple[str, str]]:
    """
    Split resume text into (header, body) pairs by detecting section headings.
    A heading is a short ALL-CAPS or Title-Case line (≤ 60 chars) that stands alone.
    """
    lines = text.splitlines()
    sections: list[tuple[str, str]] = []
    current_header = "__top__"
    current_body: list[str] = []

    heading_re = re.compile(
        r"^[A-Z][A-Za-z &/()-]{0,58}$|^[A-Z ]{3,60}$"
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            current_body.append("")
            continue
        if heading_re.match(stripped) and len(stripped) <= 60:
            if current_body:
                sections.append((current_header, "\n".join(current_body).strip()))
            current_header = stripped
            current_body = []
        else:
            current_body.append(stripped)

    if current_body:
        sections.append((current_header, "\n".join(current_body).strip()))

    return sections


def _priority_score(header: str) -> int:
    """Return sort priority (lower = more important) for a section header."""
    for idx, pattern in enumerate(_SECTION_PRIORITY):
        if re.search(pattern, header):
            return idx
    return len(_SECTION_PRIORITY)  # unknown sections are lowest priority


def limit_resume_text(text: str, char_limit: int = _RESUME_TEXT_CHAR_LIMIT) -> str:
    """
    Intelligently limit resume text to `char_limit` characters.

    Strategy:
    1. If text fits, return as-is.
    2. Otherwise split into sections, sort by priority, and greedily include
       sections until the budget is used up.
    3. Any remaining budget is used for a tail snippet of lower-priority sections.

    This preserves Contact / Education / Skills / Experience before Projects
    and Certifications, which are lower value for the LLM match.
    """
    if len(text) <= char_limit:
        return text

    logger.warning(
        "Resume text (%d chars) exceeds limit (%d chars). Applying smart trim.",
        len(text),
        char_limit,
    )

    sections = _split_sections(text)
    if not sections:
        # Fallback: head + tail split
        head = int(char_limit * 0.6)
        tail = char_limit - head
        return text[:head] + "\n\n[... trimmed ...]\n\n" + text[-tail:]

    # Sort sections by importance, keeping original order within same priority
    sorted_sections = sorted(
        enumerate(sections), key=lambda iv: (_priority_score(iv[1][0]), iv[0])
    )

    selected: list[tuple[int, str, str]] = []  # (original_index, header, body)
    remaining = char_limit

    for original_idx, (header, body) in sorted_sections:
        chunk = f"{header}\n{body}" if header != "__top__" else body
        if len(chunk) + 2 <= remaining:  # +2 for newline separator
            selected.append((original_idx, header, body))
            remaining -= len(chunk) + 2
        elif remaining > 100:
            # Partial include — take as much of the body as fits
            available = remaining - len(header) - 2
            if available > 50:
                truncated_body = body[:available].rstrip()
                selected.append((original_idx, header, truncated_body))
            remaining = 0
            break

    # Restore original document order
    selected.sort(key=lambda x: x[0])

    parts = []
    for _, header, body in selected:
        if header != "__top__":
            parts.append(f"{header}\n{body}")
        else:
            parts.append(body)

    result = "\n\n".join(parts)
    logger.info(
        "Resume text trimmed: %d → %d chars (%.0f%% kept)",
        len(text),
        len(result),
        100 * len(result) / len(text),
    )
    return result


# ── Parser functions ──────────────────────────────────────────────────────────

def parse_job_description(job_description: str, groq_client, model: str) -> JobD:
    """
    Parse a raw job description string into a structured JobD object.
    Preserved logic from resume_analyzer.py — uses Groq JSON mode.
    Token-budget fix: compact system prompt, trimmed JD text, reduced completion tokens.
    """
    # Guard JD length
    jd_text = job_description[:_JD_TEXT_CHAR_LIMIT] if len(job_description) > _JD_TEXT_CHAR_LIMIT else job_description

    # Compact system prompt — no inline schema dump, fields described tersely
    system_prompt = (
        "You are an HR assistant. Extract structured info from the job description.\n"
        "Return ONLY valid JSON with these keys:\n"
        "  role (string), required_skills (list), preferred_skills (list),\n"
        "  minimum_experience (float or null), education_requirements (list),\n"
        "  responsibilities (list).\n"
        "Rules: fill with real info only; null for missing experience; empty list if absent."
    )
    user_prompt = f"Job description:\n\n{jd_text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response_format = {"type": "json_object"}

    response = groq_client.chat.completions.create(
        model=model,
        messages=messages,
        response_format=response_format,
        max_completion_tokens=1000,  # JobD JSON: role + 5 lists → needs ~400-500 tokens; 1000 is safe
    )
    raw_json = response.choices[0].message.content
    logger.debug("Job parse raw response: %s", raw_json[:200])
    job_data = json.loads(raw_json)
    logger.info(
        "[DIAG] JD parse — top-level keys=%s | types=%s",
        list(job_data.keys()),
        {k: type(v).__name__ for k, v in job_data.items()},
    )
    return JobD(**job_data)


def parse_resume(resume_text: str, groq_client, model: str) -> Resume:
    """
    Parse raw resume text into a structured Resume object.
    Preserved logic from resume_analyzer.py — uses Groq JSON mode.
    Token-budget fix: smart resume text trimming, compact prompt, reduced completion tokens.
    """
    # Apply smart resume text limit BEFORE sending to LLM
    trimmed_text = limit_resume_text(resume_text)

    # Compact system prompt — describe fields without pasting the full JSON schema
    system_prompt = (
        "You are a resume parser. Extract information from the resume text.\n"
        "Return ONLY valid JSON with these keys:\n"
        "  name (str|null), email (str|null), phone (str|null),\n"
        "  total_experience_years (float|null), skills (list[str]),\n"
        "  experiences (list of {company,role,duration,description,skills_used}),\n"
        "  education (list[str]), projects (list[str]), certifications (list[str]).\n"
        "Rules: do not invent info; include internships in experiences; "
        "extract skills from all sections; null/empty list when absent."
    )
    user_prompt = f"Resume:\n\n{trimmed_text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
    response_format = {"type": "json_object"}

    response = groq_client.chat.completions.create(
        model=model,
        messages=messages,
        response_format=response_format,
        max_completion_tokens=1500,  # Resume JSON with experiences list → needs ~1000-1200 tokens; 1500 is safe
    )
    raw_output = response.choices[0].message.content
    logger.debug("Resume parse raw response: %s", raw_output[:200])
    data = json.loads(raw_output)
    logger.info(
        "[DIAG] Resume parse — top-level keys=%s | types=%s",
        list(data.keys()),
        {k: type(v).__name__ for k, v in data.items()},
    )
    # Check for expected keys
    expected_keys = {"name", "email", "phone", "total_experience_years",
                     "skills", "experiences", "education", "projects", "certifications"}
    missing = expected_keys - data.keys()
    if missing:
        logger.warning("[DIAG] Resume parse — MISSING expected keys: %s", missing)
    try:
        result = Resume(**data)
        logger.info("[DIAG] Resume Pydantic validation PASSED")
        return result
    except Exception as val_exc:
        logger.error("[DIAG] Resume Pydantic validation FAILED: %s", val_exc)
        raise
