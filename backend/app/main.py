"""
main.py — FastAPI application entry point.

Registers all routers, configures CORS, and sets up logging.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import configure_logging
from app.api.routes.health import router as health_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.evaluations import router as evaluations_router

# Configure logging before anything else
configure_logging()
logger = logging.getLogger(__name__)

# ── CORS origins ──────────────────────────────────────────────────────────────
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)


# ── Lifespan (replaces deprecated on_event) ───────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Resume Evaluator API starting up...")
    logger.info("Model: %s", settings.GROQ_MODEL)
    logger.info("Frontend URL: %s", settings.FRONTEND_URL)
    logger.info("Allowed origins: %s", allowed_origins)
    yield
    logger.info("Resume Evaluator API shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Resume Evaluator API",
    description=(
        "AI-powered resume screening and candidate ranking. "
        "Powered by Groq LLM. All resume processing happens server-side."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(jobs_router, prefix="/api", tags=["Jobs"])
app.include_router(evaluations_router, prefix="/api", tags=["Evaluations"])
