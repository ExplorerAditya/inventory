"""
Pydantic schemas for request validation and response serialization.
"""
from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator, model_validator


# ---------------------------------------------------------------------------
# Product schemas
# ---------------------------------------------------------------------------

class ProductBase(BaseModel):
    name: str
    sku: str
    price: float
    stock_quantity: int
    rating: Optional[float] = None
    image_data: Optional[str] = None  # Base64 data URI for the product image

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock quantity cannot be negative")
        return v


class ProductCreate(ProductBase):
    sku: Optional[str] = None  # auto-generated if not provided


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    rating: Optional[float] = None
    image_data: Optional[str] = None  # Base64 data URI for the product image

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Price must be non-negative")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def quantity_must_be_non_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Stock quantity cannot be negative")
        return v


class ProductResponse(ProductBase):
    product_id: str

    # Also expose legacy camelCase fields for frontend compatibility
    @property
    def productId(self) -> str:
        return self.product_id

    @property
    def stockQuantity(self) -> int:
        return self.stock_quantity

    model_config = {"from_attributes": True}


class ProductResponseLegacy(BaseModel):
    """camelCase response compatible with the existing Next.js frontend."""
    productId: str
    name: str
    sku: str
    price: float
    stockQuantity: int
    rating: Optional[float] = None
    imageData: Optional[str] = None  # Base64 data URI served to the frontend

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_product(cls, p) -> "ProductResponseLegacy":
        return cls(
            productId=p.product_id,
            name=p.name,
            sku=p.sku,
            price=p.price,
            stockQuantity=p.stock_quantity,
            rating=p.rating,
            imageData=p.image_data,
        )


# ---------------------------------------------------------------------------
# Customer schemas
# ---------------------------------------------------------------------------

class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    customer_id: str
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Order schemas
# ---------------------------------------------------------------------------

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be greater than zero")
        return v


class OrderCreate(BaseModel):
    customer_id: str
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    item_id: str
    product_id: str
    quantity: int
    unit_price: float
    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    order_id: str
    customer_id: str
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Legacy / Dashboard schemas (frontend-compatible camelCase)
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    userId: str
    name: str
    email: str
    model_config = {"from_attributes": True}


class ExpenseByCategoryResponse(BaseModel):
    expenseByCategoryId: str
    expenseSummaryId: str
    category: str
    amount: str          # serialized as string (BigInteger → str)
    date: datetime
    model_config = {"from_attributes": True}


class SalesSummaryResponse(BaseModel):
    salesSummaryId: str
    totalValue: float
    changePercentage: Optional[float] = None
    date: datetime
    model_config = {"from_attributes": True}


class PurchaseSummaryResponse(BaseModel):
    purchaseSummaryId: str
    totalPurchased: float
    changePercentage: Optional[float] = None
    date: datetime
    model_config = {"from_attributes": True}


class ExpenseSummaryResponse(BaseModel):
    expenseSummaryId: str
    totalExpenses: float
    date: datetime
    model_config = {"from_attributes": True}


class DashboardMetricsResponse(BaseModel):
    popularProducts: List[ProductResponseLegacy]
    salesSummary: List[SalesSummaryResponse]
    purchaseSummary: List[PurchaseSummaryResponse]
    expenseSummary: List[ExpenseSummaryResponse]
    expenseByCategorySummary: List[ExpenseByCategoryResponse]
    # Extended summary fields for new dashboard cards
    totalProducts: int = 0
    totalCustomers: int = 0
    totalOrders: int = 0
    lowStockProducts: List[ProductResponseLegacy] = []
