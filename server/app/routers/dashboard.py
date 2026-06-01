"""
Dashboard router — returns metrics compatible with the existing Next.js frontend
plus extended summary fields for new dashboard cards (totalProducts, totalCustomers,
totalOrders, lowStockProducts).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    DashboardMetricsResponse,
    ProductResponseLegacy,
    SalesSummaryResponse,
    PurchaseSummaryResponse,
    ExpenseSummaryResponse,
    ExpenseByCategoryResponse,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

LOW_STOCK_THRESHOLD = 10  # products with stock_quantity <= this are "low stock"


@router.get("", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Returns all metrics needed by the dashboard:
    - popularProducts: top 15 products by stock quantity (legacy frontend)
    - salesSummary, purchaseSummary, expenseSummary, expenseByCategorySummary (legacy)
    - totalProducts, totalCustomers, totalOrders (new cards)
    - lowStockProducts: products with stock_quantity <= LOW_STOCK_THRESHOLD
    """
    # --- Popular products (top 15 by stock, mimicking original behavior) ---
    popular_raw = (
        db.query(models.Product)
        .order_by(models.Product.stock_quantity.desc())
        .limit(15)
        .all()
    )
    popular_products = [ProductResponseLegacy.from_orm_product(p) for p in popular_raw]

    # --- Sales summary (latest 5) ---
    sales_raw = (
        db.query(models.SalesSummary)
        .order_by(models.SalesSummary.date.desc())
        .limit(5)
        .all()
    )
    sales_summary = [
        SalesSummaryResponse.model_validate(s) for s in sales_raw
    ]

    # --- Purchase summary (latest 5) ---
    purchase_raw = (
        db.query(models.PurchaseSummary)
        .order_by(models.PurchaseSummary.date.desc())
        .limit(5)
        .all()
    )
    purchase_summary = [
        PurchaseSummaryResponse.model_validate(p) for p in purchase_raw
    ]

    # --- Expense summary (latest 5) ---
    expense_raw = (
        db.query(models.ExpenseSummary)
        .order_by(models.ExpenseSummary.date.desc())
        .limit(5)
        .all()
    )
    expense_summary = [
        ExpenseSummaryResponse.model_validate(e) for e in expense_raw
    ]

    # --- Expense by category (latest 5) ---
    exp_cat_raw = (
        db.query(models.ExpenseByCategory)
        .order_by(models.ExpenseByCategory.date.desc())
        .limit(5)
        .all()
    )
    expense_by_category = [
        ExpenseByCategoryResponse(
            expenseByCategoryId=e.expenseByCategoryId,
            expenseSummaryId=e.expenseSummaryId,
            category=e.category,
            amount=str(e.amount),  # BigInteger → string (matching original behavior)
            date=e.date,
        )
        for e in exp_cat_raw
    ]

    # --- New extended metrics ---
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()

    low_stock_raw = (
        db.query(models.Product)
        .filter(models.Product.stock_quantity <= LOW_STOCK_THRESHOLD)
        .order_by(models.Product.stock_quantity.asc())
        .all()
    )
    low_stock_products = [ProductResponseLegacy.from_orm_product(p) for p in low_stock_raw]

    return DashboardMetricsResponse(
        popularProducts=popular_products,
        salesSummary=sales_summary,
        purchaseSummary=purchase_summary,
        expenseSummary=expense_summary,
        expenseByCategorySummary=expense_by_category,
        totalProducts=total_products,
        totalCustomers=total_customers,
        totalOrders=total_orders,
        lowStockProducts=low_stock_products,
    )
