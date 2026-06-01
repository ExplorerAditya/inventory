"""
Users router — legacy compatibility with the original Express/Prisma backend.
Exposes GET /users to satisfy the existing Next.js frontend.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Return all users (legacy endpoint for frontend compatibility)."""
    return db.query(models.Users).all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: dict, db: Session = Depends(get_db)):
    """Create a user (legacy endpoint)."""
    user = models.Users(
        name=payload.get("name", ""),
        email=payload.get("email", ""),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
