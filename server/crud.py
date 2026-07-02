from sqlalchemy.orm import Session
from datetime import date, datetime
import uuid
from . import models


def seed_initial_data(db: Session):
    # Check if already seeded
    if db.query(models.SKU).first() is not None:
        return

    # Create initial SKUs
    sku1 = models.SKU(
        id="d3b07384-d113-49c3-a5e0-4dfd982e4711",
        sku_id="SKU-1001",
        name="Lay's Classic 8oz",
        brand="Lay's",
        is_private_brand=False,
    )
    sku2 = models.SKU(
        id="d3b07384-d113-49c3-a5e0-4dfd982e4712",
        sku_id="SKU-1002",
        name="Clover Valley Pretzels 16oz",
        brand="Clover Valley",
        is_private_brand=True,
    )
    sku3 = models.SKU(
        id="d3b07384-d113-49c3-a5e0-4dfd982e4713",
        sku_id="SKU-2001",
        name="Clover Valley Honey Mustard Pretzels 16oz",
        brand="Clover Valley",
        is_private_brand=True,
    )

    db.add_all([sku1, sku2, sku3])
    db.commit()

    # Create SKU performance records
    perf1 = models.SKUPerformance(
        id=str(uuid.uuid4()),
        sku_id=sku1.id,
        reporting_week=date(2026, 7, 2),
        weekly_sales=1250.00,
        sales_trend_wow=12.00,
        profit_margin=35.00,
        days_of_supply=5,
        recommendation_status="GROW",
    )
    perf2 = models.SKUPerformance(
        id=str(uuid.uuid4()),
        sku_id=sku2.id,
        reporting_week=date(2026, 7, 2),
        weekly_sales=450.00,
        sales_trend_wow=-2.00,
        profit_margin=48.00,
        days_of_supply=18,
        recommendation_status="SWAP",
    )

    db.add_all([perf1, perf2])
    db.commit()


def get_dashboard_data(db: Session):
    # Ensure data is seeded
    seed_initial_data(db)

    # Query SKUs and their latest performance
    results = (
        db.query(models.SKU, models.SKUPerformance)
        .join(models.SKUPerformance, models.SKU.id == models.SKUPerformance.sku_id)
        .all()
    )

    skus_list = []
    for sku, perf in results:
        skus_list.append(
            {
                "id": sku.id,
                "sku_id": sku.sku_id,
                "name": sku.name,
                "brand": sku.brand,
                "is_private_brand": sku.is_private_brand,
                "weekly_sales": float(perf.weekly_sales),
                "sales_trend_wow": float(perf.sales_trend_wow),
                "profit_margin": float(perf.profit_margin),
                "days_of_supply": perf.days_of_supply,
                "recommendation_status": perf.recommendation_status,
            }
        )

    # Default KPIs
    kpis = {
        "sales_per_linear_ft": {"value": 145.5, "change": 2.5},
        "private_brand_pct": {"value": 28.5, "change": 1.2},
        "in_stock_rate": {"value": 96.4, "change": -0.5},
        "shelf_capacity": {"value": 82.0, "change": 0.0},
    }

    return {"kpis": kpis, "skus": skus_list}


def get_scenario_data(db: Session, scenario_name: str):
    # Ensure data is seeded
    seed_initial_data(db)

    name_lower = scenario_name.lower()
    if name_lower not in ["conservative", "balanced", "aggressive"]:
        return None

    # Define scenario projections and actions
    if name_lower == "conservative":
        projected_sales_lift = 1.5
        projected_private_brand_pct = 29.0
        sku_actions = []
    elif name_lower == "balanced":
        projected_sales_lift = 3.2
        projected_private_brand_pct = 28.1
        sku_actions = [
            {
                "sku_id": "SKU-1002",
                "name": "Clover Valley Pretzels 16oz",
                "action": "SWAP",
                "replacement_sku_id": "SKU-2001",
                "replacement_name": "Clover Valley Honey Mustard Pretzels 16oz",
            }
        ]
    else:  # aggressive
        projected_sales_lift = 5.8
        projected_private_brand_pct = 24.5  # Violates private brand guardrail (> 25%)
        sku_actions = [
            {
                "sku_id": "SKU-1002",
                "name": "Clover Valley Pretzels 16oz",
                "action": "SWAP",
                "replacement_sku_id": "SKU-2001",
                "replacement_name": "Clover Valley Honey Mustard Pretzels 16oz",
            },
            {
                "sku_id": "SKU-1001",
                "name": "Lay's Classic 8oz",
                "action": "REDUCE",
                "replacement_sku_id": None,
                "replacement_name": None,
            },
        ]

    # Guardrails: Private Brand % remains > 25%, Total SKUs within shelf capacity
    private_brand_valid = projected_private_brand_pct > 25.0
    shelf_capacity_valid = True  # Assume true for simplicity

    return {
        "scenario_name": scenario_name.capitalize(),
        "projected_sales_lift": projected_sales_lift,
        "projected_private_brand_pct": projected_private_brand_pct,
        "guardrails": {
            "private_brand_valid": private_brand_valid,
            "shelf_capacity_valid": shelf_capacity_valid,
        },
        "sku_actions": sku_actions,
    }


def create_submission(db: Session, submission_data: dict):
    # Create submission record
    sub_id = str(uuid.uuid4())
    conf_num = f"CONF-STV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"

    # Guardrails check
    private_brand_valid = submission_data["projected_private_brand_pct"] > 25.0
    shelf_capacity_valid = True
    guardrail_status = {
        "private_brand_valid": private_brand_valid,
        "shelf_capacity_valid": shelf_capacity_valid,
    }

    if not private_brand_valid:
        return None

    db_sub = models.AssortmentSubmission(
        id=sub_id,
        user_id="category_manager_1",
        scenario_name=submission_data["scenario_name"],
        projected_sales_lift=submission_data["projected_sales_lift"],
        projected_private_brand_pct=submission_data["projected_private_brand_pct"],
        guardrail_status=guardrail_status,
        submitted_at=datetime.utcnow(),
    )
    db.add(db_sub)
    db.commit()

    # Add SKU actions
    for action in submission_data["sku_actions"]:
        # Find SKU by sku_id
        sku = db.query(models.SKU).filter(models.SKU.sku_id == action["sku_id"]).first()
        if sku:
            db_action = models.SubmissionSKUAction(
                id=str(uuid.uuid4()),
                submission_id=sub_id,
                sku_id=sku.id,
                action=action["action"],
            )
            db.add(db_action)

    db.commit()

    num_actions = len(submission_data["sku_actions"])
    summary = f"Assortment changes submitted successfully! {num_actions} SKU action(s) executed under {submission_data['scenario_name']} Strategy."

    return {
        "status": "SUCCESS",
        "submission_id": sub_id,
        "confirmation_number": conf_num,
        "summary": summary,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
