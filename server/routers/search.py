from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas.search import SearchResponse
from server.services.elasticsearch_service import execute_search

router = APIRouter(prefix="/products", tags=["Search"])


@router.get(
    "/search",
    response_model=SearchResponse,
    summary="Search products with autocomplete and dynamic category filtering",
    description="Retrieves product search suggestions and autocomplete results with optional category filtering",
)
def search_products(
    q: str = Query("", description="Search query string"),
    limit: int = Query(10, ge=1, le=100, description="Number of results per page"),
    page: int = Query(1, ge=1, description="Page number"),
    category_id: Optional[str] = Query(None, description="Optional Category ID filter"),
    db: Session = Depends(get_db),
):
    try:
        return execute_search(
            db=db,
            q=q,
            limit=limit,
            page=page,
            category_id=category_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the search request: {str(e)}",
        )
