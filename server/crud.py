import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from server import models, schemas


# Tea CRUD
def get_teas(db: Session, skip: int = 0, limit: int = 100) -> List[models.Tea]:
    return db.query(models.Tea).offset(skip).limit(limit).all()


def get_tea_by_id(db: Session, tea_id: str) -> Optional[models.Tea]:
    return db.query(models.Tea).filter(models.Tea.id == tea_id).first()


def get_tea_by_name(db: Session, name: str) -> Optional[models.Tea]:
    return db.query(models.Tea).filter(models.Tea.name == name).first()


def create_tea(db: Session, tea_in: schemas.TeaCreate) -> models.Tea:
    db_tea = models.Tea(
        name=tea_in.name,
        category=tea_in.category,
        current_stock_grams=tea_in.current_stock_grams,
        min_threshold_grams=tea_in.min_threshold_grams,
        unit_price=tea_in.unit_price,
        supplier_name=tea_in.supplier_name,
    )
    db.add(db_tea)
    db.commit()
    db.refresh(db_tea)
    return db_tea


def get_tea_alerts(db: Session) -> List[models.Tea]:
    return (
        db.query(models.Tea)
        .filter(models.Tea.current_stock_grams < models.Tea.min_threshold_grams)
        .all()
    )


# Inventory CRUD
def adjust_inventory(
    db: Session, adjust_in: schemas.InventoryAdjust
) -> models.InventoryTransaction:
    tea = db.query(models.Tea).filter(models.Tea.id == adjust_in.tea_id).first()
    if not tea:
        raise ValueError("Tea not found")

    new_stock = tea.current_stock_grams + adjust_in.change_grams
    if new_stock < 0:
        raise ValueError(
            f"Insufficient stock: current stock is {tea.current_stock_grams}g, requested change is {adjust_in.change_grams}g"
        )

    tea.current_stock_grams = new_stock

    transaction = models.InventoryTransaction(
        tea_id=adjust_in.tea_id,
        change_grams=adjust_in.change_grams,
        reason=adjust_in.reason,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


# Order CRUD
def get_orders(
    db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None
) -> List[models.Order]:
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    return (
        query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
    )


def get_order_by_id(db: Session, order_id: str) -> Optional[models.Order]:
    return db.query(models.Order).filter(models.Order.id == order_id).first()


def create_order(db: Session, order_in: schemas.OrderCreate) -> models.Order:
    if not order_in.items:
        raise ValueError("Order must contain at least one item")

    # Validate all items & stock before executing transaction
    tea_deductions = {}
    item_details = []
    total_amount = 0.0

    for item in order_in.items:
        tea = db.query(models.Tea).filter(models.Tea.id == item.tea_id).first()
        if not tea:
            raise ValueError(f"Tea with ID {item.tea_id} not found")

        # Leaf deduction: 10g per cup * quantity
        leaves_needed = 10.0 * item.quantity
        tea_deductions[tea.id] = tea_deductions.get(tea.id, 0.0) + leaves_needed

        if tea.current_stock_grams < tea_deductions[tea.id]:
            raise ValueError(
                f"Insufficient stock for {tea.name}: available {tea.current_stock_grams}g, needed {tea_deductions[tea.id]}g"
            )

        # Price calculation
        extras = 0.0
        if item.milk_option == "Oat":
            extras += 0.75
        elif item.milk_option == "Almond":
            extras += 0.75
        extras += len(item.add_ons) * 0.75

        item_price = round((tea.unit_price + extras) * item.quantity, 2)
        total_amount += item_price

        item_details.append(
            {
                "tea": tea,
                "item_schema": item,
                "item_price": item_price,
                "leaves_needed": leaves_needed,
            }
        )

    total_amount = round(total_amount, 2)
    order_number = f"ORD-{uuid.uuid4().hex[:6].upper()}"

    # Create Order
    db_order = models.Order(
        order_number=order_number, total_amount=total_amount, status="COMPLETED"
    )
    db.add(db_order)
    db.flush()  # assign db_order.id

    # Create OrderItems and process stock deductions
    for detail in item_details:
        tea = detail["tea"]
        item_schema = detail["item_schema"]

        order_item = models.OrderItem(
            order_id=db_order.id,
            tea_id=tea.id,
            quantity=item_schema.quantity,
            sweetness_level=item_schema.sweetness_level,
            temperature=item_schema.temperature,
            milk_option=item_schema.milk_option,
            add_ons=item_schema.add_ons,
            item_price=detail["item_price"],
        )
        db.add(order_item)

        # Deduct stock
        tea.current_stock_grams -= detail["leaves_needed"]

        # Log inventory transaction
        inv_trans = models.InventoryTransaction(
            tea_id=tea.id,
            change_grams=-detail["leaves_needed"],
            reason="ORDER_DEDUCTION",
        )
        db.add(inv_trans)

    db.commit()
    db.refresh(db_order)
    return db_order


# Recipe CRUD
def get_recipes(
    db: Session, skip: int = 0, limit: int = 100, tea_id: Optional[str] = None
) -> List[models.Recipe]:
    query = db.query(models.Recipe)
    if tea_id:
        query = query.filter(models.Recipe.tea_id == tea_id)
    return query.offset(skip).limit(limit).all()


def get_recipe_by_id(db: Session, recipe_id: str) -> Optional[models.Recipe]:
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def create_recipe(db: Session, recipe_in: schemas.RecipeCreate) -> models.Recipe:
    tea = db.query(models.Tea).filter(models.Tea.id == recipe_in.tea_id).first()
    if not tea:
        raise ValueError(f"Tea with ID {recipe_in.tea_id} not found")

    db_recipe = models.Recipe(
        tea_id=recipe_in.tea_id,
        steep_temperature_c=recipe_in.steep_temperature_c,
        steep_time_seconds=recipe_in.steep_time_seconds,
        leaf_water_ratio_g_per_ml=recipe_in.leaf_water_ratio_g_per_ml,
        instructions=recipe_in.instructions,
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


# Quality Log CRUD
def get_quality_logs(
    db: Session, skip: int = 0, limit: int = 100, recipe_id: Optional[str] = None
) -> List[models.QualityLog]:
    query = db.query(models.QualityLog)
    if recipe_id:
        query = query.filter(models.QualityLog.recipe_id == recipe_id)
    return (
        query.order_by(models.QualityLog.brewed_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_quality_log(
    db: Session, log_in: schemas.QualityLogCreate
) -> models.QualityLog:
    recipe = (
        db.query(models.Recipe).filter(models.Recipe.id == log_in.recipe_id).first()
    )
    if not recipe:
        raise ValueError(f"Recipe with ID {log_in.recipe_id} not found")

    db_log = models.QualityLog(
        recipe_id=log_in.recipe_id, rating=log_in.rating, feedback=log_in.feedback
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
