"""
Orders router — CRUD with critical business logic:
  - Validates sufficient stock for all items before creating
  - Auto-calculates total_amount from product prices × quantities
  - Atomically deducts stock on order creation
  - Restores stock on order deletion (cancellation)
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


# ---------------------------------------------------------------------------
# GET /orders  — list all orders with items
# ---------------------------------------------------------------------------
@router.get("", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()


# ---------------------------------------------------------------------------
# POST /orders  — create order with inventory check + stock deduction
# ---------------------------------------------------------------------------
@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    # 1. Verify customer exists
    customer = db.query(models.Customer).filter(
        models.Customer.customer_id == payload.customer_id
    ).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id '{payload.customer_id}' not found.",
        )

    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An order must contain at least one item.",
        )

    # 2. Pre-validate all products and stock availability (all-or-nothing)
    resolved_items = []
    for item in payload.items:
        product = db.query(models.Product).filter(
            models.Product.product_id == item.product_id
        ).with_for_update().first()  # row-level lock

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id '{item.product_id}' not found.",
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}."
                ),
            )
        resolved_items.append((product, item.quantity))

    # 3. Calculate total amount
    total_amount = sum(product.price * qty for product, qty in resolved_items)

    # 4. Create order record
    order = models.Order(
        customer_id=payload.customer_id,
        total_amount=total_amount,
    )
    db.add(order)
    db.flush()  # get order_id before inserting items

    # 5. Create order items and deduct stock atomically
    for product, qty in resolved_items:
        order_item = models.OrderItem(
            order_id=order.order_id,
            product_id=product.product_id,
            quantity=qty,
            unit_price=product.price,
        )
        db.add(order_item)
        product.stock_quantity -= qty  # deduct stock

    db.commit()
    db.refresh(order)
    return order


# ---------------------------------------------------------------------------
# GET /orders/{id}  — get single order with items
# ---------------------------------------------------------------------------
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


# ---------------------------------------------------------------------------
# DELETE /orders/{id}  — cancel order and restore inventory
# ---------------------------------------------------------------------------
@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Restore stock for each item
    for item in order.items:
        product = db.query(models.Product).filter(
            models.Product.product_id == item.product_id
        ).first()
        if product:
            product.stock_quantity += item.quantity

    db.delete(order)
    db.commit()
