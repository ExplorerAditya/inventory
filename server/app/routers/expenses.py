"""
Expenses router — legacy compatibility with the original Express/Prisma backend.
Exposes GET /expenses returning ExpenseByCategory data as required by the frontend.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import ExpenseByCategoryResponse

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseByCategoryResponse])
def get_expenses_by_category(db: Session = Depends(get_db)):
    """
    Return all expense-by-category records sorted by date descending.
    The 'amount' field is a BigInteger serialized to string (matching original behavior).
    """
    records = (
        db.query(models.ExpenseByCategory)
        .order_by(models.ExpenseByCategory.date.desc())
        .all()
    )
    return [
        ExpenseByCategoryResponse(
            expenseByCategoryId=r.expenseByCategoryId,
            expenseSummaryId=r.expenseSummaryId,
            category=r.category,
            amount=str(r.amount),  # BigInteger → string
            date=r.date,
        )
        for r in records
    ]
