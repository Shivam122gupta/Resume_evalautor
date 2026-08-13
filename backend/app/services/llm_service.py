"""
llm_service.py — Reusable Groq LLM client with retry, backoff, and error handling.

Never exposes the API key. Wraps the Groq SDK to add:
- Retry with exponential backoff
- JSON parsing protection
- Timeout handling
- Clear error messages
"""
import json
import logging
import time
from groq import Groq, APIError, APITimeoutError, RateLimitError

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_retry_delay(exc: Exception, default: float) -> float:
    """Extract retry sleep time from API rate limit headers if present."""
    try:
        if hasattr(exc, "response") and exc.response is not None:
            headers = exc.response.headers
            if "retry-after" in headers:
                return max(0.1, float(headers["retry-after"]))
            
            # Check Groq-specific headers (e.g., "1.5s", "120ms")
            for header_name in ["x-ratelimit-reset-requests", "x-ratelimit-reset-tokens"]:
                if header_name in headers:
                    val = str(headers[header_name]).strip()
                    if val.endswith("ms"):
                        return max(0.1, float(val[:-2]) / 1000.0)
                    elif val.endswith("s"):
                        return max(0.1, float(val[:-1]))
                    return max(0.1, float(val))
    except Exception:
        pass
    return default


def compact_messages(messages: list[dict], max_chars: int = 5_000) -> list[dict]:
    """
    Cleans and truncates messages to stay safely below the input budget.
    max_chars is per-message (not total). At 4 chars/token a 5 000-char message
    is ~1 250 tokens, safely within the per-request budget after adding the
    compact prompts (~350 tokens) and completion budget (500-800 tokens).
    """
    compacted = []
    for msg in messages:
        content = msg.get("content", "")
        if isinstance(content, str) and len(content) > max_chars:
            lines = [line.strip() for line in content.splitlines()]
            cleaned_lines = [line for line in lines if line]
            cleaned_text = "\n".join(cleaned_lines)

            if len(cleaned_text) > max_chars:
                head_len = int(max_chars * 0.40)
                tail_len = int(max_chars * 0.50)
                logger.warning(
                    "Compacting payload message from %d to %d characters.",
                    len(cleaned_text),
                    max_chars
                )
                cleaned_text = (
                    f"{cleaned_text[:head_len]}\n\n"
                    f"[... content truncated to fit rate limits ...]\n\n"
                    f"{cleaned_text[-tail_len:]}"
                )
            compacted.append({"role": msg["role"], "content": cleaned_text})
        else:
            compacted.append(msg)
    return compacted


class LLMService:
    """
    Reusable Groq LLM wrapper.
    Handles retry, backoff, headers rate limits, and request-size compaction.
    """

    def __init__(self) -> None:
        settings.validate()
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
        self.max_retries = settings.LLM_MAX_RETRIES
        self.retry_delay = settings.LLM_RETRY_DELAY

    def chat_json(
        self,
        messages: list[dict],
        max_completion_tokens: int = 1000,
        operation_name: str = "llm_call",
    ) -> dict:
        """
        Send a chat completion request and return parsed JSON.
        
        Retries on rate limit/timeouts.
        If request is too large (TPM limit exceeded), it automatically compacts
        the payload, drops the output token budget, and retries.
        """
        last_error: Exception | None = None
        current_messages = messages
        current_completion_tokens = max_completion_tokens

        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(
                    "LLM call | operation=%s | attempt=%d/%d | model=%s | max_tokens=%d",
                    operation_name,
                    attempt,
                    self.max_retries,
                    self.model,
                    current_completion_tokens,
                )
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=current_messages,
                    response_format={"type": "json_object"},
                    max_completion_tokens=current_completion_tokens,
                )
                raw = response.choices[0].message.content
                if not raw:
                    raise ValueError("LLM returned empty response")

                parsed = json.loads(raw)
                logger.info("LLM call succeeded | operation=%s", operation_name)
                return parsed

            except json.JSONDecodeError as exc:
                logger.warning("LLM JSON parse error | attempt=%d | error=%s", attempt, exc)
                last_error = exc

            except RateLimitError as exc:
                err_msg = str(exc).lower()
                # Detect request-too-large vs. temporary rate-limit.
                # 413 or explicit size messages = inherently too large — do NOT retry same payload.
                is_too_large = (
                    getattr(exc, "status_code", None) == 413
                    or "limit: 8000" in err_msg
                    or "too large" in err_msg
                    or "tpm" in err_msg
                    or "tokens per minute" in err_msg
                    or "requested:" in err_msg
                )
                
                if is_too_large:
                    logger.warning("Request size rate limit hit. Compacting payload and retrying once...")
                    current_messages = compact_messages(current_messages, max_chars=4000)
                    current_completion_tokens = min(current_completion_tokens, 800)
                    # Retry immediately with compacted layout
                    try:
                        response = self.client.chat.completions.create(
                            model=self.model,
                            messages=current_messages,
                            response_format={"type": "json_object"},
                            max_completion_tokens=current_completion_tokens,
                        )
                        raw = response.choices[0].message.content
                        if raw:
                            parsed = json.loads(raw)
                            return parsed
                    except Exception as compact_exc:
                        raise RuntimeError(
                            "Resume could not be processed because the AI processing limit was reached. "
                            "Please try again or use a shorter resume."
                        ) from compact_exc

                delay = get_retry_delay(exc, self.retry_delay * attempt * 2)
                logger.warning("Rate limit hit | attempt=%d | sleeping for %.2fs...", attempt, delay)
                last_error = exc
                time.sleep(delay)

            except APITimeoutError as exc:
                logger.warning("API timeout | attempt=%d", attempt)
                last_error = exc
                time.sleep(self.retry_delay * attempt)

            except APIError as exc:
                err_msg = str(exc).lower()
                is_payload_too_large = (
                    exc.status_code == 413 or 
                    "too large" in err_msg or 
                    "rate_limit_exceeded" in err_msg or 
                    "limit: 8000" in err_msg
                )
                if is_payload_too_large:
                    logger.warning("Payload size error (status %s). Compacting and retrying once...", exc.status_code)
                    current_messages = compact_messages(current_messages, max_chars=4000)
                    current_completion_tokens = min(current_completion_tokens, 800)
                    try:
                        response = self.client.chat.completions.create(
                            model=self.model,
                            messages=current_messages,
                            response_format={"type": "json_object"},
                            max_completion_tokens=current_completion_tokens,
                        )
                        raw = response.choices[0].message.content
                        if raw:
                            parsed = json.loads(raw)
                            return parsed
                    except Exception as compact_exc:
                        raise RuntimeError(
                            "Resume could not be processed because the AI processing limit was reached. "
                            "Please try again or use a shorter resume."
                        ) from compact_exc

                delay = get_retry_delay(exc, self.retry_delay * attempt)
                logger.error("Groq API error | status=%s | %s", exc.status_code, exc)
                last_error = exc
                if attempt < self.max_retries:
                    time.sleep(delay)

            except Exception as exc:
                logger.error("Unexpected LLM error | %s", exc)
                last_error = exc
                if attempt < self.max_retries:
                    time.sleep(self.retry_delay)

        # Map rate limits cleanly to user friendly message
        err_str = str(last_error).lower()
        if "rate_limit" in err_str or "limit reached" in err_str or "too large" in err_str:
            raise RuntimeError(
                "Resume could not be processed because the AI processing limit was reached. "
                "Please try again or use a shorter resume."
            )
        
        raise RuntimeError(
            f"LLM call '{operation_name}' failed after {self.max_retries} attempts. "
            f"Last error: {last_error}"
        )

    def get_raw_client(self) -> Groq:
        """Return the raw Groq client for use in existing_logic functions."""
        return self.client


# Singleton instance
llm_service = LLMService()
