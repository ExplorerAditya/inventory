"""
Database configuration: SQLAlchemy engine, session factory, and Base class.
Supports Neon DB (and any cloud PostgreSQL) with SSL automatically.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env from the new-server/ root (one level above app/)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Add it to new-server/.env — e.g.:\n"
        "  DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require"
    )

# Neon (and most cloud PG providers) require SSL.
# If the URL already contains sslmode=, we honour it; otherwise we add require.
connect_args = {}
if "sslmode=" not in DATABASE_URL:
    connect_args["sslmode"] = "require"

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
