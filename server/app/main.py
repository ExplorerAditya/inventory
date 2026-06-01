"""
FastAPI application entry point.
Registers all routers, configures CORS, and creates tables on startup.
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.database import engine
from app import models

# Import all routers
from app.routers import (
    products,
    customers,
    orders,
    dashboard,
    users,
    expenses,
)

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Create all database tables on startup.
    Retries up to 10 times (3s apart) to handle cases where PostgreSQL
    starts slightly after the app (e.g. Docker Compose, local service delay).
    """
    max_retries = 10
    retry_delay = 3  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            models.Base.metadata.create_all(bind=engine)
            logger.info("✅ Database connected and tables ready.")
            break
        except OperationalError as e:
            if attempt < max_retries:
                logger.warning(
                    f"⏳ Database not ready (attempt {attempt}/{max_retries}). "
                    f"Retrying in {retry_delay}s... \n"
                    f"   Check that DATABASE_URL in .env is correct.\n"
                    f"   Error: {e.orig}"
                )
                await asyncio.sleep(retry_delay)
            else:
                logger.error(
                    "❌ Could not connect to the database after "
                    f"{max_retries} attempts. "
                    "Check DATABASE_URL in new-server/.env is correct and the Neon DB is active.\n"
                    f"   Current DATABASE_URL: {engine.url}"
                )
                # Don't crash — let the server start so /health still works
    yield


app = FastAPI(
    title="Inventory Management API",
    description="Python/FastAPI backend for Inventory Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow all origins in development; tighten in production via env
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(expenses.router)


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "message": "Inventory API is running"}
