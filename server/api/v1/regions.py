from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import Region
from server.schemas import RegionResponse, ErrorResponse
from server.core.cache import get_cache, set_cache

router = APIRouter(tags=["regions"])

VALID_TYPES = {"all", "state", "union_territory"}


@router.get(
    "/regions",
    response_model=List[RegionResponse],
    summary="Retrieve regional location data",
    description="Returns a JSON array of Indian states and Union Territories with filtering and searching capabilities.",
    responses={
        200: {"description": "List of regions retrieved successfully"},
        400: {"model": ErrorResponse, "description": "Invalid query parameter value"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
def get_regions(
    type: Optional[str] = Query(
        "all", description="Filter by category: 'all', 'state', or 'union_territory'"
    ),
    q: Optional[str] = Query(
        None, description="Search query string for state/UT name or capital city name"
    ),
    db: Session = Depends(get_db),
):
    type_clean = (type or "all").strip().lower()
    if type_clean not in VALID_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 'type' filter parameter. Must be one of ['all', 'state', 'union_territory'].",
        )

    q_clean = q.strip() if q and q.strip() else None

    # Check cache key
    cache_key = f"regions:type={type_clean}:q={q_clean or 'none'}"
    cached_data = get_cache(cache_key)
    if cached_data is not None:
        return cached_data

    # Query database
    query = db.query(Region)

    if type_clean != "all":
        query = query.filter(Region.type == type_clean)

    if q_clean:
        search_pattern = f"%{q_clean}%"
        query = query.filter(
            or_(Region.name.ilike(search_pattern), Region.capital.ilike(search_pattern))
        )

    regions = query.order_by(Region.name.asc()).all()

    # Serialize results to Pydantic schemas then dicts for caching/returning
    response_list = [
        RegionResponse.model_validate(r).model_dump(mode="json") for r in regions
    ]

    set_cache(cache_key, response_list, ttl=86400)
    return response_list
