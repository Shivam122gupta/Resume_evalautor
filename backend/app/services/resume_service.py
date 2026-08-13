"""
resume_service.py — Orchestrates text extraction from uploaded resume files.

Delegates to existing_logic.document_reader (preserved code).
"""
import logging
import tempfile
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException

from app.existing_logic.document_reader import read_resume
from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def validate_upload(file: UploadFile) -> None:
    """Validate file type and size before processing."""
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Only PDF and DOCX are allowed.",
        )


async def extract_text_from_upload(file: UploadFile) -> str:
    """
    Save uploaded file to a temp location, extract text via preserved read_resume(),
    then clean up the temp file.
    """
    suffix = Path(file.filename or "resume").suffix.lower()
    tmp_path: str | None = None

    try:
        # Write to temp file — safe handling
        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False
        ) as tmp:
            content = await file.read()

            # Size check
            if len(content) > settings.max_file_size_bytes:
                raise HTTPException(
                    status_code=413,
                    detail=(
                        f"File '{file.filename}' exceeds the "
                        f"{settings.MAX_FILE_SIZE_MB}MB limit."
                    ),
                )

            tmp.write(content)
            tmp_path = tmp.name

        # Extract text using the preserved function
        text = read_resume(Path(tmp_path))
        if not text or not text.strip():
            raise ValueError(f"No readable text extracted from '{file.filename}'")

        logger.info(
            "Text extracted | file=%s | chars=%d", file.filename, len(text)
        )
        return text

    finally:
        # Always delete the temp file
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)
            logger.debug("Temp file deleted: %s", tmp_path)
