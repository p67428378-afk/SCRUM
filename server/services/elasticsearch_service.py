import time
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from server.models.product import Product, Category
from server.schemas.search import SearchResponse, ProductSuggestion, CategoryCount


def execute_search(
    db: Session,
    q: str = "",
    limit: int = 10,
    page: int = 1,
    category_id: Optional[str] = None,
) -> SearchResponse:
    start_time = time.time()

    query_str = (q or "").strip()

    # If query is shorter than 3 characters and no category filter, return empty suggestions
    if len(query_str) < 3 and not category_id and query_str != "":
        took_ms = int((time.time() - start_time) * 1000)
        return SearchResponse(
            query=query_str,
            total=0,
            page=page,
            limit=limit,
            took_ms=took_ms,
            categories=[],
            suggestions=[],
        )

    base_query = db.query(Product)

    # Filter by category if provided
    if category_id:
        base_query = base_query.filter(Product.category_id == category_id)

    # Search filter across title, tags
    if query_str:
        search_pattern = f"%{query_str}%"
        base_query = base_query.filter(
            or_(
                Product.title.ilike(search_pattern),
                Product.tags.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    # Calculate total matching count
    total = base_query.count()

    # Calculate category counts breakdown for search results
    category_counts: List[CategoryCount] = []
    if total > 0:
        cat_counts_query = db.query(
            Category.id, Category.name, func.count(Product.id).label("cat_count")
        ).join(Product, Category.id == Product.category_id)
        if query_str:
            search_pattern = f"%{query_str}%"
            cat_counts_query = cat_counts_query.filter(
                or_(
                    Product.title.ilike(search_pattern),
                    Product.tags.ilike(search_pattern),
                    Product.description.ilike(search_pattern),
                )
            )
        if category_id:
            cat_counts_query = cat_counts_query.filter(
                Product.category_id == category_id
            )

        cat_counts_result = cat_counts_query.group_by(Category.id, Category.name).all()

        for cat_id, cat_name, count_val in cat_counts_result:
            category_counts.append(
                CategoryCount(id=cat_id, name=cat_name, count=count_val)
            )

    # Pagination
    offset = (page - 1) * limit
    products = base_query.offset(offset).limit(limit).all()

    suggestions: List[ProductSuggestion] = []
    for prod in products:
        category_name = prod.category.name if prod.category else None
        suggestions.append(
            ProductSuggestion(
                id=prod.id,
                title=prod.title,
                category_id=prod.category_id,
                category_name=category_name,
                price=prod.price,
                thumbnail_url=prod.thumbnail_url,
                tags=prod.tags_list,
            )
        )

    took_ms = int((time.time() - start_time) * 1000)

    return SearchResponse(
        query=query_str,
        total=total,
        page=page,
        limit=limit,
        took_ms=took_ms,
        categories=category_counts,
        suggestions=suggestions,
    )
