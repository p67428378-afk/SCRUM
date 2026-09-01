import math
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from server.app import models


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in miles between two coordinates using Haversine formula."""
    R = 3958.8  # Earth radius in miles
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def search_properties(
    db: Session,
    city: Optional[str] = None,
    zip_code: Optional[str] = None,
    neighborhood: Optional[str] = None,
    q: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius: Optional[float] = None,
    property_type: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bathrooms: Optional[float] = None,
    min_sqft: Optional[int] = None,
    max_sqft: Optional[int] = None,
    amenities: Optional[str] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[models.Property], int]:
    query = db.query(models.Property)

    # 1. Status Filter (default Active if not specified or "all")
    if status and status.lower() != "all":
        query = query.filter(func.lower(models.Property.status) == status.lower())
    elif not status:
        query = query.filter(models.Property.status == "Active")

    # 2. Location Filters
    if city:
        query = query.filter(func.lower(models.Property.city).contains(city.lower()))

    if zip_code:
        query = query.filter(models.Property.zip_code == zip_code)

    if neighborhood:
        query = query.filter(
            or_(
                func.lower(models.Property.address_street).contains(
                    neighborhood.lower()
                ),
                func.lower(models.Property.city).contains(neighborhood.lower()),
            )
        )

    # 3. Keyword Search (q or keywords)
    if q:
        search_pattern = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(models.Property.title).like(search_pattern),
                func.lower(models.Property.description).like(search_pattern),
                func.lower(models.Property.city).like(search_pattern),
                func.lower(models.Property.zip_code).like(search_pattern),
                func.lower(models.Property.address_street).like(search_pattern),
            )
        )

    # 4. Property Type Filter
    if property_type:
        types = [t.strip().lower() for t in property_type.split(",")]
        query = query.filter(func.lower(models.Property.property_type).in_(types))

    # 5. Price Range Filter
    if min_price is not None:
        query = query.filter(models.Property.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Property.price <= max_price)

    # 6. Bedrooms & Bathrooms
    if bedrooms is not None:
        query = query.filter(models.Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        query = query.filter(models.Property.bathrooms >= bathrooms)

    # 7. Square Feet Filter
    if min_sqft is not None:
        query = query.filter(models.Property.square_feet >= min_sqft)
    if max_sqft is not None:
        query = query.filter(models.Property.square_feet <= max_sqft)

    # 8. Amenities Filter
    if amenities:
        amenity_list = [a.strip().lower() for a in amenities.split(",")]
        for a_name in amenity_list:
            query = query.filter(
                models.Property.amenities.any(func.lower(models.Amenity.name) == a_name)
            )

    # 9. Radius / Geographical Filter (Bounding Box + Haversine Filter)
    all_matching = query.all()

    if (
        latitude is not None
        and longitude is not None
        and radius is not None
        and radius > 0
    ):
        filtered_by_radius = []
        for prop in all_matching:
            dist = haversine_distance(
                latitude, longitude, prop.latitude, prop.longitude
            )
            if dist <= radius:
                filtered_by_radius.append(prop)
        all_matching = filtered_by_radius

    total_count = len(all_matching)

    # 10. Sorting
    if sort_by == "price_asc":
        all_matching.sort(key=lambda p: p.price)
    elif sort_by == "price_desc":
        all_matching.sort(key=lambda p: p.price, reverse=True)
    elif sort_by == "newest":
        all_matching.sort(key=lambda p: p.created_at, reverse=True)
    elif sort_by == "sqft_desc":
        all_matching.sort(key=lambda p: p.square_feet, reverse=True)

    # 11. Pagination
    paginated_results = all_matching[skip : skip + limit]

    return paginated_results, total_count
