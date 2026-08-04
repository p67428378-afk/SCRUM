from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from server.database import get_db
from server import crud, schemas

router = APIRouter()


@router.get("/alerts", response_model=schemas.StockAlertListResponse)
def list_alerts(
    status: Optional[str] = Query(
        None, description="Filter status: ACTIVE, ACKNOWLEDGED, RESOLVED"
    ),
    db: Session = Depends(get_db),
):
    alerts = crud.get_alerts(db, status=status)
    return schemas.StockAlertListResponse(alerts=alerts)


@router.put("/alerts/{alert_id}", response_model=schemas.StockAlertResponse)
def update_alert(
    alert_id: str, alert_update: schemas.StockAlertUpdate, db: Session = Depends(get_db)
):
    updated = crud.update_alert_status(
        db, alert_id=alert_id, new_status=alert_update.status
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found",
        )
    # Re-fetch formatted response
    alerts = crud.get_alerts(db)
    for a in alerts:
        if a.id == alert_id:
            return a
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found after update"
    )
