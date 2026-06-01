"""
Products router — full CRUD with business logic:
  - SKU must be unique
  - Stock quantity cannot be negative
  - Search by name (query param)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponseLegacy,
)

router = APIRouter(prefix="/products", tags=["Products"])


# ---------------------------------------------------------------------------
# GET /products  — list all products, optional search by name
# ---------------------------------------------------------------------------
@router.get("", response_model=List[ProductResponseLegacy])
def get_products(
    search: Optional[str] = Query(None, description="Filter by product name"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)
    if search:
        query = query.filter(models.Product.name.ilike(f"%{search}%"))
    products = query.all()
    return [ProductResponseLegacy.from_orm_product(p) for p in products]


# ---------------------------------------------------------------------------
# POST /products  — create a product
# ---------------------------------------------------------------------------
@router.post("", response_model=ProductResponseLegacy, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
):
    # Auto-generate SKU if not provided (e.g. from frontend create form)
    import re as _re, uuid as _uuid
    sku = payload.sku
    if not sku:
        slug = _re.sub(r"[^A-Z0-9]", "-", payload.name.upper())[:8].strip("-")
        sku = f"{slug}-{_uuid.uuid4().hex[:4].upper()}"

    # Check SKU uniqueness
    existing = db.query(models.Product).filter(models.Product.sku == sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{sku}' already exists.",
        )

    product = models.Product(
        name=payload.name,
        sku=sku,
        price=payload.price,
        stock_quantity=payload.stock_quantity,
        rating=payload.rating,
        image_data=payload.image_data,
    )
    db.add(product)
    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SKU must be unique.",
        )
    return ProductResponseLegacy.from_orm_product(product)


# ---------------------------------------------------------------------------
# GET /products/{id}  — get single product
# ---------------------------------------------------------------------------
@router.get("/{product_id}", response_model=ProductResponseLegacy)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductResponseLegacy.from_orm_product(product)


# ---------------------------------------------------------------------------
# PUT /products/{id}  — update product
# ---------------------------------------------------------------------------
@router.put("/{product_id}", response_model=ProductResponseLegacy)
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)

    # If SKU is being changed, verify uniqueness
    if "sku" in update_data and update_data["sku"] != product.sku:
        conflict = (
            db.query(models.Product)
            .filter(models.Product.sku == update_data["sku"])
            .first()
        )
        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A product with SKU '{update_data['sku']}' already exists.",
            )

    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="SKU conflict.")

    return ProductResponseLegacy.from_orm_product(product)


# ---------------------------------------------------------------------------
# DELETE /products/{id}  — delete product
# ---------------------------------------------------------------------------
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.delete(product)
    db.commit()
