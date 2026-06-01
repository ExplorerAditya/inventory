"""
Customers router — CRUD with email uniqueness enforcement.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models
from app.schemas import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


# ---------------------------------------------------------------------------
# GET /customers  — list all customers
# ---------------------------------------------------------------------------
@router.get("", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()


# ---------------------------------------------------------------------------
# POST /customers  — create a customer
# ---------------------------------------------------------------------------
@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    # Check email uniqueness
    existing = db.query(models.Customer).filter(
        models.Customer.email == payload.email
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A customer with email '{payload.email}' already exists.",
        )

    customer = models.Customer(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
    )
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email must be unique.",
        )
    return customer


# ---------------------------------------------------------------------------
# GET /customers/{id}  — get single customer
# ---------------------------------------------------------------------------
@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(
        models.Customer.customer_id == customer_id
    ).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


# ---------------------------------------------------------------------------
# DELETE /customers/{id}  — delete a customer
# ---------------------------------------------------------------------------
@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(
        models.Customer.customer_id == customer_id
    ).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    db.delete(customer)
    db.commit()
