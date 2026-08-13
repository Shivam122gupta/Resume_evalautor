"""
config.py — Application configuration via environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # File upload limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_FILES_PER_REQUEST: int = int(os.getenv("MAX_FILES_PER_REQUEST", "20"))

    # LLM retry config
    LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "3"))
    LLM_RETRY_DELAY: float = float(os.getenv("LLM_RETRY_DELAY", "2.0"))

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    def validate(self) -> None:
        if not self.GROQ_API_KEY:
            raise ValueError(
                "GROQ_API_KEY is not set. "
                "Please add it to your .env file or environment."
            )


settings = Settings()
