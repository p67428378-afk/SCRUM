from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Product
from app.schemas import (
    InventoryItemCreate,
    InventoryItemUpdate,
    InventoryItemResponse,
    PaginatedInventoryResponse,
    DashboardStatsResponse,
    AuditLogListResponse,
    AuditLogResponseItem,
    AttributesResponse,
)
from app.crud import (
    create_inventory_item,
    get_inventory_item,
    update_inventory_item,
    delete_inventory_item,
    get_inventory_items,
    get_dashboard_stats,
    get_audit_logs,
    compute_status,
)

router = APIRouter()


def product_to_response(product: Product) -> InventoryItemResponse:
    qty = product.inventory.stock_quantity if product.inventory else 0
    thresh = product.inventory.low_stock_threshold if product.inventory else 5
    status = compute_status(qty, thresh)
    return InventoryItemResponse(
        id=product.id,
        name=product.name,
        category=product.category.name if product.category else "Unknown",
        material=product.material.name if product.material else "Unknown",
        gemstone_type=product.gemstone.name if product.gemstone else None,
        carat_weight=float(product.carat_weight)
        if product.carat_weight is not None
        else None,
        price=float(product.price),
        stock_quantity=qty,
        low_stock_threshold=thresh,
        status=status,
    )


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def read_dashboard_stats(db: Session = Depends(get_db)):
    try:
        stats = get_dashboard_stats(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory", response_model=PaginatedInventoryResponse)
def read_inventory(
    category: Optional[str] = None,
    material: Optional[str] = None,
    gemstone: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db),
):
    try:
        items, total = get_inventory_items(
            db,
            category=category,
            material=material,
            gemstone=gemstone,
            min_price=min_price,
            max_price=max_price,
            status=status,
            search=search,
            page=page,
            limit=limit,
        )
        response_items = [product_to_response(item) for item in items]
        return PaginatedInventoryResponse(
            items=response_items, limit=limit, page=page, total=total
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/inventory", response_model=InventoryItemResponse)
def create_item(
    item: InventoryItemCreate,
    x_user_id: str = Header("manager123", alias="X-User-ID"),
    db: Session = Depends(get_db),
):
    try:
        product = create_inventory_item(db, item, user_id=x_user_id)
        return product_to_response(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/inventory/{id}", response_model=InventoryItemResponse)
def read_item(id: str, db: Session = Depends(get_db)):
    product = get_inventory_item(db, id)
    if not product:
        raise HTTPException(status_code=404, detail="Item not found")
    return product_to_response(product)


@router.put("/inventory/{id}", response_model=InventoryItemResponse)
def update_item(
    id: str,
    item: InventoryItemUpdate,
    x_user_id: str = Header("manager123", alias="X-User-ID"),
    db: Session = Depends(get_db),
):
    product = update_inventory_item(db, id, item, user_id=x_user_id)
    if not product:
        raise HTTPException(status_code=404, detail="Item not found")
    return product_to_response(product)


@router.delete("/inventory/{id}", status_code=204)
def delete_item(
    id: str,
    x_user_id: str = Header("manager123", alias="X-User-ID"),
    db: Session = Depends(get_db),
):
    success = delete_inventory_item(db, id, user_id=x_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@router.get("/audit-log", response_model=AuditLogListResponse)
def read_audit_logs(db: Session = Depends(get_db)):
    try:
        logs = get_audit_logs(db)
        response_logs = []
        for log in logs:
            response_logs.append(
                AuditLogResponseItem(
                    id=log.id,
                    product_id=log.product_id,
                    product_name=log.product.name if log.product else None,
                    action=log.action,
                    details=log.details,
                    user_id=log.user_id,
                    created_at=log.created_at,
                )
            )
        return AuditLogListResponse(logs=response_logs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/attributes", response_model=AttributesResponse)
def read_attributes(db: Session = Depends(get_db)):
    try:
        # Default attributes from spec
        categories = ["Ring", "Necklace", "Earring", "Bracelet"]
        gemstones = ["Diamond", "Ruby", "Emerald", "Sapphire", "None"]
        materials = ["Gold", "Silver", "Platinum"]
        return AttributesResponse(
            categories=categories, gemstones=gemstones, materials=materials
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
