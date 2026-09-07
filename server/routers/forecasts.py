from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.location import Location
from server.schemas.forecast import ForecastResponse
from server.services.forecast_service import get_or_generate_forecasts

router = APIRouter(prefix="/api/v1/forecasts", tags=["forecasts"])


@router.get("", response_model=ForecastResponse)
def get_forecasts(
    location_id: str = Query(..., description="UUID of location"),
    db: Session = Depends(get_db),
):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID '{location_id}' not found.",
        )

    return get_or_generate_forecasts(db, location_id)
