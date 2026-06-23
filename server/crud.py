from sqlalchemy.orm import Session
from sqlalchemy import or_
from server.models import JewelryItem
from server.schemas import JewelryItemCreate, JewelryItemUpdate
from typing import Optional


def get_jewelry_item(db: Session, item_id: str) -> Optional[JewelryItem]:
    return db.query(JewelryItem).filter(JewelryItem.id == item_id).first()


def get_jewelry_item_by_sku(db: Session, sku: str) -> Optional[JewelryItem]:
    return db.query(JewelryItem).filter(JewelryItem.sku == sku).first()


def get_jewelry_items(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    material: Optional[str] = None,
    gemstone_type: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "asc",
):
    query = db.query(JewelryItem)

    # Filtering
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                JewelryItem.sku.ilike(search_filter),
                JewelryItem.name.ilike(search_filter),
            )
        )

    if material:
        # Support case-insensitive exact match or partial match
        query = query.filter(JewelryItem.material.ilike(material))

    if gemstone_type:
        query = query.filter(JewelryItem.gemstone_type.ilike(gemstone_type))

    # Total count before pagination
    total = query.count()

    # Sorting
    if sort_by:
        col = getattr(JewelryItem, sort_by, None)
        if col is not None:
            if sort_order.lower() == "desc":
                query = query.order_by(col.desc())
            else:
                query = query.order_by(col.asc())
    else:
        # Default sort by created_at desc
        query = query.order_by(JewelryItem.created_at.desc())

    # Pagination
    items = query.offset(skip).limit(limit).all()
    return items, total


def create_jewelry_item(db: Session, item: JewelryItemCreate) -> JewelryItem:
    db_item = JewelryItem(
        sku=item.sku,
        name=item.name,
        description=item.description,
        material=item.material,
        carat_weight=item.carat_weight,
        gemstone_type=item.gemstone_type,
        price=item.price,
        quantity=item.quantity,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_jewelry_item(
    db: Session, item_id: str, item_update: JewelryItemUpdate
) -> Optional[JewelryItem]:
    db_item = get_jewelry_item(db, item_id)
    if not db_item:
        return None

    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.commit()
    db.refresh(db_item)
    return db_item


def delete_jewelry_item(db: Session, item_id: str) -> bool:
    db_item = get_jewelry_item(db, item_id)
    if not db_item:
        return False
    db.delete(db_item)
    db.commit()
    return True


def record_sale(
    db: Session, item_id: str, quantity_sold: int = 1
) -> Optional[JewelryItem]:
    """
    Decrements the quantity of an item when a sale is made.
    Satisfies AC 4: "provide a mechanism for this to be updated automatically when a sale is made in the future"
    """
    db_item = get_jewelry_item(db, item_id)
    if not db_item:
        return None

    # Ensure quantity doesn't go below 0
    new_qty = max(0, db_item.quantity - quantity_sold)
    db_item.quantity = new_qty
    db.commit()
    db.refresh(db_item)
    return db_item
