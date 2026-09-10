from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    active_crop_cycles = (
        db.query(models.CropCycle)
        .filter(models.CropCycle.status.in_(["PLANTED", "ACTIVE"]))
        .count()
    )

    livestock_headcount = db.query(models.Livestock).count()

    equipment_operating = (
        db.query(models.Equipment)
        .filter(models.Equipment.status == "OPERATIONAL")
        .count()
    )

    inventory_items = db.query(models.InventoryItem).all()
    low_inventory_count = sum(
        1 for item in inventory_items if item.quantity <= item.reorder_threshold
    )

    unresolved_alerts = (
        db.query(models.OperationalAlert)
        .filter(models.OperationalAlert.is_resolved.is_(False))
        .all()
    )

    return {
        "active_crop_cycles": active_crop_cycles,
        "livestock_headcount": livestock_headcount,
        "equipment_operating": equipment_operating,
        "low_inventory_count": low_inventory_count,
        "alerts": unresolved_alerts,
    }
