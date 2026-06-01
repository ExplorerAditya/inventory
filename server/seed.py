"""
Database seed script for the new-server backend.
Run with: python seed.py
Populates: Products, Customers, Orders, Users, Expenses, SalesSummary,
           PurchaseSummary, ExpenseSummary, ExpenseByCategory
"""
import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Allow running from new-server/ directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import (
    Base,
    Product,
    Customer,
    Order,
    OrderItem,
    Users,
    Expenses,
    SalesSummary,
    PurchaseSummary,
    ExpenseSummary,
    ExpenseByCategory,
)
from app.database import DATABASE_URL

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
db = Session()


def _encode_image(path: str) -> str | None:
    """Read an image file and return a Base64 data URI string."""
    try:
        import base64
        import mimetypes
        mime, _ = mimetypes.guess_type(path)
        mime = mime or "image/png"
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:{mime};base64,{data}"
    except FileNotFoundError:
        print(f"  [WARN] Asset not found: {path} -- image_data will be NULL")
        return None


def seed():
    print("[SEED] Seeding database...")

    # Locate client assets (relative to this script → ../client/src/assets/)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(script_dir, "..", "client", "src", "assets")

    # Encode the three product images
    image_uris = [
        _encode_image(os.path.join(assets_dir, "product1.png")),
        _encode_image(os.path.join(assets_dir, "product2.png")),
        _encode_image(os.path.join(assets_dir, "product3.png")),
    ]
    print(f"  [IMG] Loaded {sum(1 for u in image_uris if u)} / {len(image_uris)} product images from assets")

    # Clear existing data (in dependency order)
    db.query(OrderItem).delete()
    db.query(Order).delete()
    db.query(ExpenseByCategory).delete()
    db.query(ExpenseSummary).delete()
    db.query(PurchaseSummary).delete()
    db.query(SalesSummary).delete()
    db.query(Expenses).delete()
    db.query(Users).delete()
    db.query(Customer).delete()
    db.query(Product).delete()
    db.commit()

    # ---- Products (images assigned round-robin from assets) ----
    product_data = [
        ("Laptop Pro 15",             "LPT-001", 1299.99, 45,  4.5),
        ("Wireless Mouse",            "WMS-002", 29.99,   150, 4.2),
        ("Mechanical Keyboard",       "MKB-003", 89.99,   8,   4.7),
        ('4K Monitor 27"',            "MON-004", 399.99,  22,  4.6),
        ("USB-C Hub 7-in-1",          "HUB-005", 49.99,   5,   4.0),
        ("Noise Cancelling Headphones","NCH-006",249.99,  30,  4.8),
        ("Webcam HD 1080p",           "WCM-007", 79.99,   3,   4.1),
        ("Desk Lamp LED",             "DLP-008", 39.99,   60,  4.3),
        ("Portable SSD 1TB",          "SSD-009", 109.99,  0,   4.5),
        ("Standing Desk Mat",         "SDM-010", 59.99,   12,  4.4),
    ]
    products = [
        Product(
            name=name,
            sku=sku,
            price=price,
            stock_quantity=qty,
            rating=rating,
            image_data=image_uris[i % len(image_uris)],  # round-robin assignment
        )
        for i, (name, sku, price, qty, rating) in enumerate(product_data)
    ]
    db.add_all(products)
    db.commit()
    print(f"  [OK] {len(products)} products (with images)")


    # ---- Customers ----
    customers = [
        Customer(full_name="Alice Johnson",  email="alice@example.com",  phone="555-0101"),
        Customer(full_name="Bob Martinez",   email="bob@example.com",    phone="555-0102"),
        Customer(full_name="Carol Williams", email="carol@example.com",  phone="555-0103"),
        Customer(full_name="David Brown",    email="david@example.com",  phone="555-0104"),
        Customer(full_name="Eve Davis",      email="eve@example.com",    phone="555-0105"),
    ]
    db.add_all(customers)
    db.commit()
    print(f"  [OK] {len(customers)} customers")

    # ---- Orders ----
    p = {prod.sku: prod for prod in products}
    c = customers[0]
    order1 = Order(customer_id=c.customer_id, total_amount=0.0)
    db.add(order1)
    db.flush()
    items1 = [
        OrderItem(order_id=order1.order_id, product_id=p["LPT-001"].product_id, quantity=1, unit_price=p["LPT-001"].price),
        OrderItem(order_id=order1.order_id, product_id=p["WMS-002"].product_id, quantity=2, unit_price=p["WMS-002"].price),
    ]
    db.add_all(items1)
    order1.total_amount = sum(i.unit_price * i.quantity for i in items1)
    p["LPT-001"].stock_quantity -= 1
    p["WMS-002"].stock_quantity -= 2

    order2 = Order(customer_id=customers[1].customer_id, total_amount=0.0)
    db.add(order2)
    db.flush()
    items2 = [
        OrderItem(order_id=order2.order_id, product_id=p["MON-004"].product_id, quantity=1, unit_price=p["MON-004"].price),
    ]
    db.add_all(items2)
    order2.total_amount = sum(i.unit_price * i.quantity for i in items2)
    p["MON-004"].stock_quantity -= 1
    db.commit()
    print("  [OK] 2 orders")

    # ---- Legacy Users ----
    users = [
        Users(name="Admin User",   email="admin@inventory.com"),
        Users(name="Store Manager", email="manager@inventory.com"),
        Users(name="Sales Rep",    email="sales@inventory.com"),
    ]
    db.add_all(users)
    db.commit()
    print(f"  [OK] {len(users)} users (legacy)")

    # ---- Sales Summary ----
    now = datetime.utcnow()
    sales_summaries = [
        SalesSummary(totalValue=12500.00, changePercentage=8.5,  date=now - timedelta(days=i * 7))
        for i in range(5)
    ]
    db.add_all(sales_summaries)

    # ---- Purchase Summary ----
    purchase_summaries = [
        PurchaseSummary(totalPurchased=8200.00, changePercentage=3.2, date=now - timedelta(days=i * 7))
        for i in range(5)
    ]
    db.add_all(purchase_summaries)

    # ---- Expense Summary + by Category ----
    for i in range(3):
        exp_sum = ExpenseSummary(totalExpenses=3500.00, date=now - timedelta(days=i * 30))
        db.add(exp_sum)
        db.flush()
        for category, amount in [("Office", 1200), ("Salaries", 1800), ("Professional", 500)]:
            db.add(ExpenseByCategory(
                expenseSummaryId=exp_sum.expenseSummaryId,
                category=category,
                amount=amount,
                date=now - timedelta(days=i * 30),
            ))

    db.commit()
    print("  [OK] Summary data (sales, purchases, expenses)")
    print("\n[DONE] Seed complete!")


if __name__ == "__main__":
    seed()
    db.close()
