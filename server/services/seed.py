import uuid
from sqlalchemy.orm import Session
from server.models import ClusterMetric, ScenarioConfig, SKU


def seed_cluster_metrics(db: Session):
    existing = db.query(ClusterMetric).filter(
        ClusterMetric.cluster_name == "Small Town Value Cluster",
        ClusterMetric.category == "Snacks"
    ).first()

    if not existing:
        metric = ClusterMetric(
            id=str(uuid.uuid4()),
            cluster_name="Small Town Value Cluster",
            category="Snacks",
            sales_per_linear_ft=1250.00,
            private_brand_percentage=28.00,
            in_stock_rate=96.50,
            shelf_capacity_utilization=85.00
        )
        db.add(metric)
        db.commit()


def seed_scenario_configs(db: Session):
    scenarios = [
        {
            "scenario_type": "Conservative",
            "description": "Prioritizes low risk and minimal shelf rearrangement",
            "projected_sales_lift_pct": 1.80,
            "projected_pb_share_pct": 26.50,
            "projected_capacity_pct": 81.00,
            "is_default": False,
            "grow_count": 6,
            "maintain_count": 16,
            "swap_count": 4,
            "reduce_count": 2
        },
        {
            "scenario_type": "Balanced",
            "description": "Optimal balance of Private Brand expansion, margin lift, and shelf throughput",
            "projected_sales_lift_pct": 4.60,
            "projected_pb_share_pct": 28.00,
            "projected_capacity_pct": 85.00,
            "is_default": True,
            "grow_count": 12,
            "maintain_count": 10,
            "swap_count": 4,
            "reduce_count": 2
        },
        {
            "scenario_type": "Aggressive",
            "description": "Maximizes Clover Valley shelf space and gross margin contribution",
            "projected_sales_lift_pct": 7.20,
            "projected_pb_share_pct": 32.50,
            "projected_capacity_pct": 92.00,
            "is_default": False,
            "grow_count": 14,
            "maintain_count": 8,
            "swap_count": 5,
            "reduce_count": 2
        }
    ]

    for s_data in scenarios:
        existing = db.query(ScenarioConfig).filter(
            ScenarioConfig.scenario_type == s_data["scenario_type"]
        ).first()
        if not existing:
            config = ScenarioConfig(
                id=str(uuid.uuid4()),
                **s_data
            )
            db.add(config)
    db.commit()


def seed_skus(db: Session):
    sku_list = [
        # 12 GROW (Private Brand Clover Valley)
        {
            "sku_code": "SKU-10492",
            "product_name": "Clover Valley Classic Potato Chips 8oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 412.0,
            "sales_per_linear_ft": 1340.00,
            "margin_percentage": 44.20,
            "linear_ft_allocated": 3.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10493",
            "product_name": "Clover Valley Sour Cream & Onion Chips 8oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 380.0,
            "sales_per_linear_ft": 1290.00,
            "margin_percentage": 45.00,
            "linear_ft_allocated": 3.0,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10494",
            "product_name": "Clover Valley Barbecue Chips 8oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 350.0,
            "sales_per_linear_ft": 1210.00,
            "margin_percentage": 43.50,
            "linear_ft_allocated": 2.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10495",
            "product_name": "Clover Valley Cheese Puffs 7oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 310.0,
            "sales_per_linear_ft": 1150.00,
            "margin_percentage": 46.00,
            "linear_ft_allocated": 2.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10496",
            "product_name": "Clover Valley Tortilla Chips 13oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 420.0,
            "sales_per_linear_ft": 1380.00,
            "margin_percentage": 42.00,
            "linear_ft_allocated": 3.0,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10497",
            "product_name": "Clover Valley Bite Size Pretzels 16oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 290.0,
            "sales_per_linear_ft": 1120.00,
            "margin_percentage": 48.00,
            "linear_ft_allocated": 2.0,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10498",
            "product_name": "Clover Valley White Cheddar Popcorn 5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 275.0,
            "sales_per_linear_ft": 1080.00,
            "margin_percentage": 47.50,
            "linear_ft_allocated": 2.0,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10499",
            "product_name": "Clover Valley Movie Theater Butter Popcorn 6ct",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 330.0,
            "sales_per_linear_ft": 1190.00,
            "margin_percentage": 44.80,
            "linear_ft_allocated": 2.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10500",
            "product_name": "Clover Valley Peanut Butter Creme Cookies 16oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 360.0,
            "sales_per_linear_ft": 1260.00,
            "margin_percentage": 41.50,
            "linear_ft_allocated": 2.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10501",
            "product_name": "Clover Valley Chewy Fudge Cookies 12oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 305.0,
            "sales_per_linear_ft": 1140.00,
            "margin_percentage": 43.00,
            "linear_ft_allocated": 2.0,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10502",
            "product_name": "Clover Valley Gummy Bears 8oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 280.0,
            "sales_per_linear_ft": 1050.00,
            "margin_percentage": 50.00,
            "linear_ft_allocated": 1.5,
            "status_badge": "GROW"
        },
        {
            "sku_code": "SKU-10503",
            "product_name": "Clover Valley Trail Mix Mountain Blend 10oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": True,
            "weekly_units_sold": 260.0,
            "sales_per_linear_ft": 1310.00,
            "margin_percentage": 40.00,
            "linear_ft_allocated": 2.0,
            "status_badge": "GROW"
        },

        # 10 MAINTAIN (National Brands)
        {
            "sku_code": "SKU-22819",
            "product_name": "Cheez-It Original Baked Crackers 7oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 520.0,
            "sales_per_linear_ft": 1420.00,
            "margin_percentage": 29.80,
            "linear_ft_allocated": 4.2,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22820",
            "product_name": "Lay's Classic Potato Chips 8oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 600.0,
            "sales_per_linear_ft": 1580.00,
            "margin_percentage": 27.50,
            "linear_ft_allocated": 4.5,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22821",
            "product_name": "Doritos Nacho Cheese Tortilla Chips 9.25oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 580.0,
            "sales_per_linear_ft": 1550.00,
            "margin_percentage": 28.00,
            "linear_ft_allocated": 4.5,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22822",
            "product_name": "Pringles Original Potato Crisps 5.2oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 450.0,
            "sales_per_linear_ft": 1300.00,
            "margin_percentage": 31.00,
            "linear_ft_allocated": 3.0,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22823",
            "product_name": "Oreo Original Chocolate Sandwich Cookies 14.3oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 510.0,
            "sales_per_linear_ft": 1400.00,
            "margin_percentage": 26.50,
            "linear_ft_allocated": 3.5,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22824",
            "product_name": "Ritz Original Crackers 13.7oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 430.0,
            "sales_per_linear_ft": 1280.00,
            "margin_percentage": 28.50,
            "linear_ft_allocated": 3.0,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22825",
            "product_name": "Goldfish Cheddar Crackers 6.6oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 390.0,
            "sales_per_linear_ft": 1220.00,
            "margin_percentage": 30.00,
            "linear_ft_allocated": 2.5,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22826",
            "product_name": "Cheetos Crunchy Cheese Flavored Snacks 8.5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 540.0,
            "sales_per_linear_ft": 1490.00,
            "margin_percentage": 27.00,
            "linear_ft_allocated": 4.0,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22827",
            "product_name": "Fritos Original Corn Chips 9.25oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 370.0,
            "sales_per_linear_ft": 1180.00,
            "margin_percentage": 29.00,
            "linear_ft_allocated": 2.5,
            "status_badge": "MAINTAIN"
        },
        {
            "sku_code": "SKU-22828",
            "product_name": "Ruffles Cheddar & Sour Cream Chips 8.5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 410.0,
            "sales_per_linear_ft": 1250.00,
            "margin_percentage": 28.00,
            "linear_ft_allocated": 3.0,
            "status_badge": "MAINTAIN"
        },

        # 4 SWAP (Regional Brands)
        {
            "sku_code": "SKU-59102",
            "product_name": "Regional Barbecue Twists 6oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 94.0,
            "sales_per_linear_ft": 620.00,
            "margin_percentage": 22.10,
            "linear_ft_allocated": 1.8,
            "status_badge": "SWAP"
        },
        {
            "sku_code": "SKU-59103",
            "product_name": "Southern Kettle Cooked Jalapeno Chips 5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 88.0,
            "sales_per_linear_ft": 590.00,
            "margin_percentage": 21.50,
            "linear_ft_allocated": 1.8,
            "status_badge": "SWAP"
        },
        {
            "sku_code": "SKU-59104",
            "product_name": "Prairie Harvest Multigrain Crisps 6oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 82.0,
            "sales_per_linear_ft": 560.00,
            "margin_percentage": 23.00,
            "linear_ft_allocated": 1.5,
            "status_badge": "SWAP"
        },
        {
            "sku_code": "SKU-59105",
            "product_name": "Rustic Ridge Salt & Vinegar Chips 5.5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 90.0,
            "sales_per_linear_ft": 610.00,
            "margin_percentage": 22.00,
            "linear_ft_allocated": 1.5,
            "status_badge": "SWAP"
        },

        # 2 REDUCE (Slow moving / low margin)
        {
            "sku_code": "SKU-77218",
            "product_name": "Slow-Moving Salted Corn Puffs 5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 68.0,
            "sales_per_linear_ft": 480.00,
            "margin_percentage": 18.90,
            "linear_ft_allocated": 1.8,
            "status_badge": "REDUCE"
        },
        {
            "sku_code": "SKU-77219",
            "product_name": "Artisan Baked Onion Crisps 4.5oz",
            "category": "Snacks",
            "cluster_id": "Small Town Value Cluster",
            "is_private_brand": False,
            "weekly_units_sold": 55.0,
            "sales_per_linear_ft": 420.00,
            "margin_percentage": 17.50,
            "linear_ft_allocated": 1.8,
            "status_badge": "REDUCE"
        }
    ]

    for sku_dict in sku_list:
        existing = db.query(SKU).filter(SKU.sku_code == sku_dict["sku_code"]).first()
        if not existing:
            sku_obj = SKU(
                id=str(uuid.uuid4()),
                **sku_dict
            )
            db.add(sku_obj)
    db.commit()


def seed_all_data(db: Session):
    seed_cluster_metrics(db)
    seed_scenario_configs(db)
    seed_skus(db)
