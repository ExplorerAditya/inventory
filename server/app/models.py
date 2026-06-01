"""
SQLAlchemy ORM models for all database tables.
Covers: Products, Customers, Orders, OrderItems, Users, Expenses,
        SalesSummary, PurchaseSummary, ExpenseSummary, ExpenseByCategory.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean,
    DateTime, ForeignKey, Text, BigInteger, Numeric
)
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# New models: Products, Customers, Orders
# ---------------------------------------------------------------------------

class Product(Base):
    __tablename__ = "products"

    product_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), nullable=False, unique=True, index=True)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    rating = Column(Float, nullable=True)
    image_data = Column(Text, nullable=True)  # Base64 data URI (data:image/...;base64,...)

    order_items = relationship("OrderItem", back_populates="product")


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(50), nullable=True)

    orders = relationship("Order", back_populates="customer")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, ForeignKey("customers.customer_id"), nullable=False)
    total_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    item_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ---------------------------------------------------------------------------
# Legacy-compatible models (mirrors original Prisma schema)
# ---------------------------------------------------------------------------

class Users(Base):
    """Legacy users table — mirrors original Prisma Users model."""
    __tablename__ = "users"

    userId = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)


class Expenses(Base):
    """Legacy expenses table."""
    __tablename__ = "expenses"

    expenseId = Column(String, primary_key=True, default=generate_uuid)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class SalesSummary(Base):
    __tablename__ = "sales_summary"

    salesSummaryId = Column(String, primary_key=True, default=generate_uuid)
    totalValue = Column(Float, nullable=False)
    changePercentage = Column(Float, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)


class PurchaseSummary(Base):
    __tablename__ = "purchase_summary"

    purchaseSummaryId = Column(String, primary_key=True, default=generate_uuid)
    totalPurchased = Column(Float, nullable=False)
    changePercentage = Column(Float, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)


class ExpenseSummary(Base):
    __tablename__ = "expense_summary"

    expenseSummaryId = Column(String, primary_key=True, default=generate_uuid)
    totalExpenses = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)

    expense_by_category = relationship("ExpenseByCategory", back_populates="expense_summary")


class ExpenseByCategory(Base):
    __tablename__ = "expense_by_category"

    expenseByCategoryId = Column(String, primary_key=True, default=generate_uuid)
    expenseSummaryId = Column(String, ForeignKey("expense_summary.expenseSummaryId"), nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(BigInteger, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)

    expense_summary = relationship("ExpenseSummary", back_populates="expense_by_category")
