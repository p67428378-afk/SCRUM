from sqlalchemy.orm import Session
from app.models import Category, Material, Gemstone, Product, Inventory, AuditLog
from app.schemas import InventoryItemCreate, InventoryItemUpdate
from typing import Optional, Tuple, List, Dict, Any


def get_or_create_category(db: Session, name: str) -> Category:
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        category = Category(name=name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category


def get_or_create_material(db: Session, name: str) -> Material:
    material = db.query(Material).filter(Material.name == name).first()
    if not material:
        material = Material(name=name)
        db.add(material)
        db.commit()
        db.refresh(material)
    return material


def get_or_create_gemstone(db: Session, name: Optional[str]) -> Optional[Gemstone]:
    if not name or name.lower() == "none":
        return None
    gemstone = db.query(Gemstone).filter(Gemstone.name == name).first()
    if not gemstone:
        gemstone = Gemstone(name=name)
        db.add(gemstone)
        db.commit()
        db.refresh(gemstone)
    return gemstone


def compute_status(stock_quantity: int, low_stock_threshold: int) -> str:
    if stock_quantity == 0:
        return "out_of_stock"
    elif stock_quantity < low_stock_threshold:
        return "low_stock"
    else:
        return "in_stock"


def log_audit(
    db: Session,
    action: str,
    details: str,
    product_id: Optional[str] = None,
    user_id: str = "manager123",
):
    audit_log = AuditLog(
        product_id=product_id, action=action, details=details, user_id=user_id
    )
    db.add(audit_log)
    db.commit()


def create_inventory_item(
    db: Session, item: InventoryItemCreate, user_id: str = "manager123"
) -> Product:
    category = get_or_create_category(db, item.category)
    material = get_or_create_material(db, item.material)
    gemstone = get_or_create_gemstone(db, item.gemstone_type)

    product = Product(
        name=item.name,
        category_id=category.id,
        material_id=material.id,
        gemstone_id=gemstone.id if gemstone else None,
        carat_weight=item.carat_weight,
        price=item.price,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    inventory = Inventory(
        product_id=product.id,
        stock_quantity=item.stock_quantity,
        low_stock_threshold=item.low_stock_threshold,
    )
    db.add(inventory)
    db.commit()
    db.refresh(product)

    log_audit(
        db,
        action="CREATE",
        details=f"Created item '{product.name}' with initial stock {inventory.stock_quantity}.",
        product_id=product.id,
        user_id=user_id,
    )

    return product


def get_inventory_item(db: Session, product_id: str) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()


def update_inventory_item(
    db: Session, product_id: str, item: InventoryItemUpdate, user_id: str = "manager123"
) -> Optional[Product]:
    product = get_inventory_item(db, product_id)
    if not product:
        return None

    category = get_or_create_category(db, item.category)
    material = get_or_create_material(db, item.material)
    gemstone = get_or_create_gemstone(db, item.gemstone_type)

    old_price = product.price
    old_stock = product.inventory.stock_quantity if product.inventory else 0

    product.name = item.name
    product.category_id = category.id
    product.material_id = material.id
    product.gemstone_id = gemstone.id if gemstone else None
    product.carat_weight = item.carat_weight
    product.price = item.price

    if product.inventory:
        product.inventory.stock_quantity = item.stock_quantity
        product.inventory.low_stock_threshold = item.low_stock_threshold
    else:
        inventory = Inventory(
            product_id=product.id,
            stock_quantity=item.stock_quantity,
            low_stock_threshold=item.low_stock_threshold,
        )
        db.add(inventory)

    db.commit()
    db.refresh(product)

    # Build audit details
    changes = []
    if old_price != product.price:
        changes.append(f"price from ${old_price} to ${product.price}")
    if old_stock != item.stock_quantity:
        changes.append(f"quantity from {old_stock} to {item.stock_quantity}")

    details = f"Updated '{product.name}'"
    if changes:
        details += " " + ", ".join(changes) + "."
    else:
        details += " details."

    log_audit(
        db, action="UPDATE", details=details, product_id=product.id, user_id=user_id
    )

    return product


def delete_inventory_item(
    db: Session, product_id: str, user_id: str = "manager123"
) -> bool:
    product = get_inventory_item(db, product_id)
    if not product:
        return False

    product_name = product.name
    db.delete(product)
    db.commit()

    log_audit(
        db,
        action="DELETE",
        details=f"Deleted item '{product_name}'.",
        product_id=None,
        user_id=user_id,
    )
    return True


def get_inventory_items(
    db: Session,
    category: Optional[str] = None,
    material: Optional[str] = None,
    gemstone: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[Product], int]:
    query = db.query(Product).join(Inventory)

    if category:
        query = query.join(Category).filter(Category.name == category)
    if material:
        query = query.join(Material).filter(Material.name == material)
    if gemstone:
        query = query.join(Gemstone, Product.gemstone_id == Gemstone.id).filter(
            Gemstone.name == gemstone
        )
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if status:
        if status == "out_of_stock":
            query = query.filter(Inventory.stock_quantity == 0)
        elif status == "low_stock":
            query = query.filter(
                Inventory.stock_quantity > 0,
                Inventory.stock_quantity < Inventory.low_stock_threshold,
            )
        elif status == "in_stock":
            query = query.filter(
                Inventory.stock_quantity >= Inventory.low_stock_threshold
            )

    total = query.count()
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    return items, total


def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    products = db.query(Product).join(Inventory).all()

    total_items = len(products)
    total_value = 0.0
    low_stock_count = 0
    out_of_stock_count = 0

    category_vals: Dict[str, float] = {}
    category_counts: Dict[str, int] = {}

    for p in products:
        qty = p.inventory.stock_quantity if p.inventory else 0
        val = float(p.price) * qty
        total_value += val

        # Status counts
        thresh = p.inventory.low_stock_threshold if p.inventory else 5
        if qty == 0:
            out_of_stock_count += 1
        elif qty < thresh:
            low_stock_count += 1

        # Category distribution
        cat_name = p.category.name if p.category else "Unknown"
        category_vals[cat_name] = category_vals.get(cat_name, 0.0) + val
        category_counts[cat_name] = category_counts.get(cat_name, 0) + 1

    category_distribution = []
    for cat, val in category_vals.items():
        category_distribution.append(
            {"category": cat, "count": category_counts[cat], "value": val}
        )

    return {
        "category_distribution": category_distribution,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_items": total_items,
        "total_value": total_value,
    }


def get_audit_logs(db: Session) -> List[AuditLog]:
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
