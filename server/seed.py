import logging
import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from server.models import User, SKU, ClusterMetric, ScenarioConfig, SubmissionAudit

logger = logging.getLogger(__name__)


def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def run_seeds(db: Session) -> None:
    """Seed initial data idempotently into the database."""
    try:
        # 1. Seed Users
        users_data = [
            {
                "email": "test@example.com",
                "password": "testpassword",
                "full_name": "DG Category Manager",
                "role": "category_manager",
            },
            {
                "email": "admin@example.com",
                "password": "adminpassword",
                "full_name": "DG System Admin",
                "role": "admin",
            },
            {
                "email": "user@dollargeneral.com",
                "password": "testpassword",
                "full_name": "Small Town Value Merchandiser",
                "role": "category_manager",
            },
        ]

        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    is_active=True,
                    is_verified=True,
                )
                db.add(user)

        db.commit()
    except IntegrityError:
        db.rollback()

    try:
        # 2. Seed Cluster Metrics
        cluster_name = "Small Town Value Cluster"
        metric = (
            db.query(ClusterMetric)
            .filter(ClusterMetric.cluster_name == cluster_name)
            .first()
        )
        if not metric:
            metric = ClusterMetric(
                cluster_name=cluster_name,
                sales_per_linear_ft=1250.0,
                private_brand_pct=28.0,
                in_stock_rate=96.5,
                shelf_capacity_pct=92.0,
                total_skus=36,
            )
            db.add(metric)
        db.commit()
    except IntegrityError:
        db.rollback()

    try:
        # 3. Seed Scenario Configs
        scenarios_data = [
            {
                "scenario_key": "conservative",
                "display_name": "Conservative",
                "description": "Low-risk assortment optimization prioritizing inventory turnover and minimal shelf reconfiguration.",
                "projected_sales_lift_pct": 3.2,
                "projected_private_brand_pct": 29.5,
                "projected_shelf_capacity_pct": 88.0,
                "risk_level": "Low",
                "grow_count": 4,
                "maintain_count": 26,
                "swap_count": 4,
                "reduce_count": 2,
                "is_default": False,
            },
            {
                "scenario_key": "balanced",
                "display_name": "Balanced",
                "description": "Optimized mix balancing margin gains with shelf stability and targeted private brand expansion.",
                "projected_sales_lift_pct": 5.8,
                "projected_private_brand_pct": 30.5,
                "projected_shelf_capacity_pct": 91.5,
                "risk_level": "Moderate",
                "grow_count": 12,
                "maintain_count": 18,
                "swap_count": 4,
                "reduce_count": 2,
                "is_default": True,
            },
            {
                "scenario_key": "aggressive",
                "display_name": "Aggressive",
                "description": "High-growth strategy heavily weighting high-margin Clover Valley private brand products.",
                "projected_sales_lift_pct": 8.5,
                "projected_private_brand_pct": 32.0,
                "projected_shelf_capacity_pct": 95.0,
                "risk_level": "High",
                "grow_count": 18,
                "maintain_count": 10,
                "swap_count": 6,
                "reduce_count": 2,
                "is_default": False,
            },
        ]

        for s in scenarios_data:
            existing_s = (
                db.query(ScenarioConfig)
                .filter(ScenarioConfig.scenario_key == s["scenario_key"])
                .first()
            )
            if not existing_s:
                db.add(ScenarioConfig(**s))

        db.commit()
    except IntegrityError:
        db.rollback()

    try:
        # 4. Seed Snacks SKUs (36 items: exactly 12 GROW, 18 MAINTAIN, 4 SWAP, 2 REDUCE)
        skus_data = [
            # --- Salty Snacks (10 SKUs: 4 GROW, 5 MAINTAIN, 1 SWAP, 0 REDUCE) ---
            {
                "sku_code": "SNK-CV-001",
                "product_name": "Clover Valley Classic Potato Chips 8oz",
                "sub_category": "Salty Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1420.0,
                "margin_pct": 44.5,
                "units_sold": 3850,
                "action_badge": "GROW",
                "shelf_space_inches": 16.0,
                "current_stock": 68,
                "in_stock_rate": 97.2,
            },
            {
                "sku_code": "SNK-NB-002",
                "product_name": "Lay's Classic Potato Chips 8oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1380.0,
                "margin_pct": 31.0,
                "units_sold": 4120,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 18.0,
                "current_stock": 75,
                "in_stock_rate": 98.0,
            },
            {
                "sku_code": "SNK-NB-003",
                "product_name": "Doritos Nacho Cheese 9.25oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1450.0,
                "margin_pct": 32.5,
                "units_sold": 4400,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 18.0,
                "current_stock": 80,
                "in_stock_rate": 97.8,
            },
            {
                "sku_code": "SNK-CV-004",
                "product_name": "Clover Valley Restaurant Style Tortilla Chips 13oz",
                "sub_category": "Salty Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1290.0,
                "margin_pct": 46.0,
                "units_sold": 3200,
                "action_badge": "GROW",
                "shelf_space_inches": 14.0,
                "current_stock": 55,
                "in_stock_rate": 96.0,
            },
            {
                "sku_code": "SNK-NB-005",
                "product_name": "Cheetos Crunchy Cheese Snacks 8.5oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1310.0,
                "margin_pct": 30.5,
                "units_sold": 3900,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 16.0,
                "current_stock": 70,
                "in_stock_rate": 96.8,
            },
            {
                "sku_code": "SNK-NB-006",
                "product_name": "Pringles Sour Cream & Onion 5.5oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1180.0,
                "margin_pct": 29.0,
                "units_sold": 2800,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 48,
                "in_stock_rate": 95.5,
            },
            {
                "sku_code": "SNK-CV-007",
                "product_name": "Clover Valley Mini Pretzels 16oz",
                "sub_category": "Salty Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1210.0,
                "margin_pct": 48.2,
                "units_sold": 2950,
                "action_badge": "GROW",
                "shelf_space_inches": 12.0,
                "current_stock": 52,
                "in_stock_rate": 96.4,
            },
            {
                "sku_code": "SNK-NB-008",
                "product_name": "Ruffles Cheddar & Sour Cream 8.5oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1240.0,
                "margin_pct": 30.0,
                "units_sold": 3100,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 14.0,
                "current_stock": 50,
                "in_stock_rate": 96.1,
            },
            {
                "sku_code": "SNK-CV-009",
                "product_name": "Clover Valley Cheese Puffs 8oz",
                "sub_category": "Salty Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1330.0,
                "margin_pct": 45.0,
                "units_sold": 3400,
                "action_badge": "GROW",
                "shelf_space_inches": 14.0,
                "current_stock": 60,
                "in_stock_rate": 96.9,
            },
            {
                "sku_code": "SNK-NB-010",
                "product_name": "Fritos Chili Cheese Corn Chips 9.25oz",
                "sub_category": "Salty Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 890.0,
                "margin_pct": 27.5,
                "units_sold": 1600,
                "action_badge": "SWAP",
                "shelf_space_inches": 12.0,
                "current_stock": 35,
                "in_stock_rate": 94.0,
            },
            # --- Cookies & Crackers (10 SKUs: 2 GROW, 7 MAINTAIN, 1 SWAP, 0 REDUCE) ---
            {
                "sku_code": "SNK-CV-011",
                "product_name": "Clover Valley Sandwich Creme Cookies 15.25oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1360.0,
                "margin_pct": 47.0,
                "units_sold": 3600,
                "action_badge": "GROW",
                "shelf_space_inches": 14.0,
                "current_stock": 62,
                "in_stock_rate": 97.0,
            },
            {
                "sku_code": "SNK-NB-012",
                "product_name": "Oreo Original Chocolate Sandwich Cookies 14.3oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1490.0,
                "margin_pct": 33.0,
                "units_sold": 4600,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 18.0,
                "current_stock": 85,
                "in_stock_rate": 98.2,
            },
            {
                "sku_code": "SNK-NB-013",
                "product_name": "Chips Ahoy! Original Chocolate Chip 13oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1280.0,
                "margin_pct": 31.5,
                "units_sold": 3300,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 16.0,
                "current_stock": 58,
                "in_stock_rate": 96.5,
            },
            {
                "sku_code": "SNK-CV-014",
                "product_name": "Clover Valley Honey Graham Crackers 14.4oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1150.0,
                "margin_pct": 43.0,
                "units_sold": 2700,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 46,
                "in_stock_rate": 95.8,
            },
            {
                "sku_code": "SNK-NB-015",
                "product_name": "Cheez-It Original Baked Snack Crackers 12.4oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1370.0,
                "margin_pct": 32.0,
                "units_sold": 3950,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 16.0,
                "current_stock": 72,
                "in_stock_rate": 97.4,
            },
            {
                "sku_code": "SNK-NB-016",
                "product_name": "Ritz Original Crackers 13.7oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1320.0,
                "margin_pct": 30.8,
                "units_sold": 3700,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 16.0,
                "current_stock": 68,
                "in_stock_rate": 96.7,
            },
            {
                "sku_code": "SNK-CV-017",
                "product_name": "Clover Valley Original Saltine Crackers 16oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1120.0,
                "margin_pct": 42.5,
                "units_sold": 2600,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 44,
                "in_stock_rate": 95.5,
            },
            {
                "sku_code": "SNK-NB-018",
                "product_name": "Keebler Fudge Stripes Cookies 11.5oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 860.0,
                "margin_pct": 28.0,
                "units_sold": 1500,
                "action_badge": "SWAP",
                "shelf_space_inches": 12.0,
                "current_stock": 30,
                "in_stock_rate": 93.8,
            },
            {
                "sku_code": "SNK-CV-019",
                "product_name": "Clover Valley Vanilla Wafers 11oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1270.0,
                "margin_pct": 46.5,
                "units_sold": 3100,
                "action_badge": "GROW",
                "shelf_space_inches": 12.0,
                "current_stock": 54,
                "in_stock_rate": 96.6,
            },
            {
                "sku_code": "SNK-NB-020",
                "product_name": "Goldfish Baked Cheddar Crackers 6.6oz",
                "sub_category": "Cookies & Crackers",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1220.0,
                "margin_pct": 31.0,
                "units_sold": 3000,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 50,
                "in_stock_rate": 96.2,
            },
            # --- Candy & Sweet Snacks (10 SKUs: 4 GROW, 5 MAINTAIN, 0 SWAP, 1 REDUCE) ---
            {
                "sku_code": "SNK-NB-021",
                "product_name": "Reese's Peanut Butter Cups Standard 1.5oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1520.0,
                "margin_pct": 34.0,
                "units_sold": 5200,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 90,
                "in_stock_rate": 98.5,
            },
            {
                "sku_code": "SNK-CV-022",
                "product_name": "Clover Valley Gummy Bears 12oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1390.0,
                "margin_pct": 49.0,
                "units_sold": 3750,
                "action_badge": "GROW",
                "shelf_space_inches": 12.0,
                "current_stock": 65,
                "in_stock_rate": 97.1,
            },
            {
                "sku_code": "SNK-NB-023",
                "product_name": "M&M's Milk Chocolate Candies Share Size 3.14oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1340.0,
                "margin_pct": 32.5,
                "units_sold": 3800,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 70,
                "in_stock_rate": 97.0,
            },
            {
                "sku_code": "SNK-NB-024",
                "product_name": "Snickers King Size Bar 3.29oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1360.0,
                "margin_pct": 33.2,
                "units_sold": 4100,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 76,
                "in_stock_rate": 97.3,
            },
            {
                "sku_code": "SNK-CV-025",
                "product_name": "Clover Valley Assorted Hard Candies 14oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1190.0,
                "margin_pct": 51.0,
                "units_sold": 2850,
                "action_badge": "GROW",
                "shelf_space_inches": 10.0,
                "current_stock": 48,
                "in_stock_rate": 96.0,
            },
            {
                "sku_code": "SNK-NB-026",
                "product_name": "Skittles Original Candy Bag 4oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1250.0,
                "margin_pct": 31.8,
                "units_sold": 3200,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 10.0,
                "current_stock": 54,
                "in_stock_rate": 96.3,
            },
            {
                "sku_code": "SNK-CV-027",
                "product_name": "Clover Valley Chocolate Chip Mini Cookies 6oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1280.0,
                "margin_pct": 47.5,
                "units_sold": 3150,
                "action_badge": "GROW",
                "shelf_space_inches": 10.0,
                "current_stock": 56,
                "in_stock_rate": 96.8,
            },
            {
                "sku_code": "SNK-NB-028",
                "product_name": "Twix Caramel Cookie Bar Share Size 3.02oz",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1270.0,
                "margin_pct": 32.0,
                "units_sold": 3300,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 10.0,
                "current_stock": 58,
                "in_stock_rate": 96.5,
            },
            {
                "sku_code": "SNK-CV-029",
                "product_name": "Clover Valley Mixed Fruit Snacks 10ct",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1310.0,
                "margin_pct": 48.0,
                "units_sold": 3350,
                "action_badge": "GROW",
                "shelf_space_inches": 12.0,
                "current_stock": 60,
                "in_stock_rate": 96.9,
            },
            {
                "sku_code": "SNK-NB-030",
                "product_name": "Hershey's Milk Chocolate Bar 6-Pack",
                "sub_category": "Candy & Sweet Snacks",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 780.0,
                "margin_pct": 24.5,
                "units_sold": 1100,
                "action_badge": "REDUCE",
                "shelf_space_inches": 12.0,
                "current_stock": 25,
                "in_stock_rate": 92.5,
            },
            # --- Meat Snacks & Jerky (4 SKUs: 2 GROW, 1 MAINTAIN, 1 SWAP, 0 REDUCE) ---
            {
                "sku_code": "SNK-CV-031",
                "product_name": "Clover Valley Original Beef Jerky 3.25oz",
                "sub_category": "Meat Snacks & Jerky",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1410.0,
                "margin_pct": 45.8,
                "units_sold": 2900,
                "action_badge": "GROW",
                "shelf_space_inches": 10.0,
                "current_stock": 50,
                "in_stock_rate": 96.7,
            },
            {
                "sku_code": "SNK-NB-032",
                "product_name": "Slim Jim Giant Smoked Snack Stick 0.97oz",
                "sub_category": "Meat Snacks & Jerky",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 1480.0,
                "margin_pct": 35.0,
                "units_sold": 5600,
                "action_badge": "MAINTAIN",
                "shelf_space_inches": 12.0,
                "current_stock": 95,
                "in_stock_rate": 98.4,
            },
            {
                "sku_code": "SNK-NB-033",
                "product_name": "Jack Link's Teriyaki Beef Jerky 2.85oz",
                "sub_category": "Meat Snacks & Jerky",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 910.0,
                "margin_pct": 26.0,
                "units_sold": 1400,
                "action_badge": "SWAP",
                "shelf_space_inches": 10.0,
                "current_stock": 28,
                "in_stock_rate": 93.5,
            },
            {
                "sku_code": "SNK-CV-034",
                "product_name": "Clover Valley Smoked Meat Sticks 8ct",
                "sub_category": "Meat Snacks & Jerky",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 1260.0,
                "margin_pct": 46.2,
                "units_sold": 2800,
                "action_badge": "GROW",
                "shelf_space_inches": 10.0,
                "current_stock": 46,
                "in_stock_rate": 96.2,
            },
            # --- Nuts & Seeds (2 SKUs: 0 GROW, 0 MAINTAIN, 1 SWAP, 1 REDUCE) ---
            {
                "sku_code": "SNK-CV-035",
                "product_name": "Clover Valley Mountain Trail Mix 9oz",
                "sub_category": "Nuts & Seeds",
                "brand_type": "Private Brand",
                "sales_per_linear_ft": 870.0,
                "margin_pct": 28.5,
                "units_sold": 1550,
                "action_badge": "SWAP",
                "shelf_space_inches": 10.0,
                "current_stock": 32,
                "in_stock_rate": 93.8,
            },
            {
                "sku_code": "SNK-NB-036",
                "product_name": "Planters Salted Whole Cashews 8.5oz",
                "sub_category": "Nuts & Seeds",
                "brand_type": "National Brand",
                "sales_per_linear_ft": 750.0,
                "margin_pct": 23.0,
                "units_sold": 950,
                "action_badge": "REDUCE",
                "shelf_space_inches": 8.0,
                "current_stock": 20,
                "in_stock_rate": 92.0,
            },
        ]

        for s_data in skus_data:
            existing_sku = (
                db.query(SKU).filter(SKU.sku_code == s_data["sku_code"]).first()
            )
            if not existing_sku:
                db.add(SKU(**s_data))

        db.commit()
    except IntegrityError:
        db.rollback()

    try:
        # 5. Seed an Initial Sample Submission Audit
        sample_audit = (
            db.query(SubmissionAudit)
            .filter(SubmissionAudit.audit_id == "AUD-2026-9981")
            .first()
        )
        if not sample_audit:
            audit = SubmissionAudit(
                audit_id="AUD-2026-9981",
                user_id="user@dollargeneral.com",
                cluster_name="Small Town Value Cluster",
                scenario="Balanced",
                total_modified_skus=18,
                guardrail_status="ALL PASSED",
                status="APPROVED",
                notes="Initial approved assortment plan for Q3 Small Town Value Cluster.",
            )
            db.add(audit)
            db.commit()
    except IntegrityError:
        db.rollback()
