from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server import models, schemas
from server.auth import get_current_user

router = APIRouter(prefix="/api/v1/equipment", tags=["equipment"])


@router.get("", response_model=List[schemas.EquipmentResponse])
def list_equipment(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Equipment).all()


@router.post(
    "", response_model=schemas.EquipmentResponse, status_code=status.HTTP_201_CREATED
)
def create_equipment(
    equip_data: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    equip = models.Equipment(
        name=equip_data.name,
        serial_number=equip_data.serial_number,
        operating_hours=equip_data.operating_hours,
        status=equip_data.status or "OPERATIONAL",
        last_service_date=equip_data.last_service_date,
        maintenance_threshold_hours=equip_data.maintenance_threshold_hours,
    )

    # Check threshold on creation
    if equip.operating_hours >= equip.maintenance_threshold_hours:
        equip.status = "MAINTENANCE_DUE"

    db.add(equip)
    db.commit()
    db.refresh(equip)

    if equip.status == "MAINTENANCE_DUE":
        alert = models.OperationalAlert(
            alert_type="EQUIPMENT_MAINTENANCE",
            severity="WARNING",
            message=f"Equipment '{equip.name}' reached maintenance threshold ({equip.operating_hours} hrs)",
            is_resolved=False,
        )
        db.add(alert)
        db.commit()

    return equip


@router.get("/{id}", response_model=schemas.EquipmentResponse)
def get_equipment(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    equip = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equip


@router.post(
    "/{id}/maintenance",
    response_model=schemas.MaintenanceLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_maintenance(
    id: str,
    log_data: schemas.MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    equip = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if log_data.operating_hours_logged > 0:
        equip.operating_hours += log_data.operating_hours_logged

    equip.last_service_date = log_data.service_date

    # Check if threshold reached after logging or if serviced
    if equip.operating_hours >= equip.maintenance_threshold_hours:
        equip.status = "MAINTENANCE_DUE"
        alert = models.OperationalAlert(
            alert_type="EQUIPMENT_MAINTENANCE",
            severity="WARNING",
            message=f"Equipment '{equip.name}' reached maintenance threshold ({equip.operating_hours} hrs)",
            is_resolved=False,
        )
        db.add(alert)
    elif log_data.service_type in ["PREVENTATIVE", "REPAIR"]:
        equip.status = "OPERATIONAL"

    m_log = models.MaintenanceLog(
        equipment_id=id,
        service_date=log_data.service_date,
        operating_hours_logged=log_data.operating_hours_logged,
        service_type=log_data.service_type,
        description=log_data.description,
        cost=log_data.cost,
    )
    db.add(m_log)
    db.commit()
    db.refresh(m_log)
    return m_log


@router.get("/{id}/maintenance", response_model=List[schemas.MaintenanceLogResponse])
def list_maintenance(
    id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    equip = db.query(models.Equipment).filter(models.Equipment.id == id).first()
    if not equip:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equip.maintenance_logs
