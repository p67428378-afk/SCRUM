from sqlalchemy.orm import Session
from . import models
from typing import Optional
import uuid
import random
import datetime


def get_skus(db: Session, search: Optional[str] = None, status: Optional[str] = None):
    query = db.query(models.SKU)
    if search:
        query = query.filter(models.SKU.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(models.SKU.status == status)
    return query.all()


def create_sku(
    db: Session,
    name: str,
    sales_performance: float,
    shelf_space: float,
    private_brand: bool,
    status: str,
):
    db_sku = models.SKU(
        id=str(uuid.uuid4()),
        name=name,
        sales_performance=sales_performance,
        shelf_space=shelf_space,
        private_brand=private_brand,
        status=status,
    )
    db.add(db_sku)
    db.commit()
    db.refresh(db_sku)
    return db_sku


def seed_skus(db: Session):
    if db.query(models.SKU).count() == 0:
        initial_skus = [
            {
                "name": "Clover Valley Potato Chips Classic 10oz",
                "sales_performance": 12500.5,
                "shelf_space": 2.5,
                "private_brand": True,
                "status": "GROW",
            },
            {
                "name": "Clover Valley Tortilla Chips 16oz",
                "sales_performance": 512.00,
                "shelf_space": 2.5,
                "private_brand": True,
                "status": "GROW",
            },
            {
                "name": "Lay's Classic Potato Chips 13oz",
                "sales_performance": 380.00,
                "shelf_space": 3.0,
                "private_brand": False,
                "status": "MAINTAIN",
            },
            {
                "name": "Clover Valley Potato Chips 12oz",
                "sales_performance": 290.00,
                "shelf_space": 2.0,
                "private_brand": True,
                "status": "SWAP",
            },
            {
                "name": "Cheetos Crunchy 8.5oz",
                "sales_performance": 440.00,
                "shelf_space": 1.5,
                "private_brand": False,
                "status": "MAINTAIN",
            },
            {
                "name": "Clover Valley Pretzel Twists 16oz",
                "sales_performance": 180.00,
                "shelf_space": 1.0,
                "private_brand": True,
                "status": "REDUCE",
            },
        ]
        for sku_data in initial_skus:
            name = str(sku_data["name"])
            sales_perf = sku_data["sales_performance"]
            shelf_space = sku_data["shelf_space"]
            private_brand = bool(sku_data["private_brand"])
            status = str(sku_data["status"])

            assert isinstance(sales_perf, (int, float))
            assert isinstance(shelf_space, (int, float))

            create_sku(
                db,
                name=name,
                sales_performance=sales_perf,
                shelf_space=shelf_space,
                private_brand=private_brand,
                status=status,
            )


def create_assortment_review(
    db: Session,
    scenario_name: str,
    submission_data: dict,
    user_id: str = "category_manager_1",
):
    date_str = datetime.date.today().strftime("%Y-%m-%d")
    random_suffix = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=4))
    audit_id = f"{date_str}-{random_suffix}"

    db_review = models.AssortmentReview(
        id=str(uuid.uuid4()),
        scenario_name=scenario_name,
        user_id=user_id,
        submission_data=submission_data,
        audit_id=audit_id,
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
