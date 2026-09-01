import statistics
from datetime import datetime
from typing import Optional, Dict, List
from collections import defaultdict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from server.app.database import get_db
from server.app.models import Property, PropertyPriceHistory
from server.app.schemas import CmaAnalyticsResponse, PriceTrendPoint

router = APIRouter()


@router.get("/cma", response_model=CmaAnalyticsResponse)
def get_cma_analytics(
    city: Optional[str] = Query(None, description="City name to analyze"),
    zip_code: Optional[str] = Query(None, description="Zip code to analyze"),
    db: Session = Depends(get_db),
):
    if zip_code:
        location = zip_code
    elif city:
        location = city
    else:
        location = "All"

    query = db.query(Property)
    if zip_code:
        query = query.filter(Property.zip_code == zip_code)
    elif city:
        query = query.filter(Property.city.ilike(f"%{city}%"))

    properties = query.all()

    if not properties:
        return CmaAnalyticsResponse(
            location=location,
            insufficient_data=True,
            median_price_per_sqft=0.0,
            average_days_on_market=0.0,
            price_trend_points=[],
        )

    # 1. Median price per sqft
    sqft_prices = []
    for prop in properties:
        if prop.sqft and prop.sqft > 0:
            sqft_prices.append(prop.price / prop.sqft)

    median_price_sqft = round(statistics.median(sqft_prices), 2) if sqft_prices else 0.0

    # 2. Average Days on Market (DOM)
    now = datetime.utcnow()
    dom_values = []
    for prop in properties:
        created = prop.created_at or now
        dom = max(0, (now - created).days)
        dom_values.append(dom)

    avg_dom = round(sum(dom_values) / len(dom_values), 1) if dom_values else 0.0

    # 3. Monthly price trend line points
    # Query price history for matching properties
    prop_ids = [p.id for p in properties]
    prop_sqft_map = {p.id: p.sqft for p in properties if p.sqft and p.sqft > 0}

    history_entries = (
        db.query(PropertyPriceHistory)
        .filter(PropertyPriceHistory.property_id.in_(prop_ids))
        .order_by(PropertyPriceHistory.recorded_at.asc())
        .all()
    )

    monthly_sqft_prices: Dict[str, List[float]] = defaultdict(list)

    for entry in history_entries:
        sqft = prop_sqft_map.get(entry.property_id)
        if sqft and sqft > 0:
            month_str = entry.recorded_at.strftime("%Y-%m")
            monthly_sqft_prices[month_str].append(entry.price / sqft)

    # If no price history exists, fallback to properties created_at
    if not monthly_sqft_prices:
        for prop in properties:
            if prop.sqft and prop.sqft > 0:
                created = prop.created_at or now
                month_str = created.strftime("%Y-%m")
                monthly_sqft_prices[month_str].append(prop.price / prop.sqft)

    trend_points = []
    for month in sorted(monthly_sqft_prices.keys()):
        prices = monthly_sqft_prices[month]
        avg_price_sqft = round(sum(prices) / len(prices), 2)
        trend_points.append(
            PriceTrendPoint(month=month, avg_price_per_sqft=avg_price_sqft)
        )

    return CmaAnalyticsResponse(
        location=location,
        insufficient_data=False,
        median_price_per_sqft=median_price_sqft,
        average_days_on_market=avg_dom,
        price_trend_points=trend_points,
    )
