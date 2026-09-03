from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import Table, Reservation
from server.schemas import (
    TableCreate,
    TableResponse,
    TableUpdate,
    ReservationCreate,
    ReservationResponse,
)

router = APIRouter()


def _parse_res_time(time_str: str) -> Optional[datetime]:
    if not time_str:
        return None
    try:
        # Handles ISO strings like '2026-06-01T18:00:00+00:00' or '2026-06-01T18:00:00.000Z'
        dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
        return dt
    except Exception:
        pass
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(time_str, fmt)
        except Exception:
            pass
    return None


def _is_overlapping(dt1: datetime, dt2: datetime, window_minutes: int = 120) -> bool:
    # If both datetimes have/don't have tzinfo, compare directly; otherwise strip tzinfo
    if (dt1.tzinfo is None) != (dt2.tzinfo is None):
        dt1 = dt1.replace(tzinfo=None)
        dt2 = dt2.replace(tzinfo=None)
    diff_seconds = abs((dt1 - dt2).total_seconds())
    return diff_seconds < (window_minutes * 60)


@router.get("", response_model=List[TableResponse])
@router.get("/", response_model=List[TableResponse])
def get_tables(db: Session = Depends(get_db)):
    tables = db.query(Table).order_by(Table.table_number.asc()).all()
    return tables


@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(table_in: TableCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Table).filter(Table.table_number == table_in.table_number).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table number {table_in.table_number} already exists",
        )

    table = Table(
        table_number=table_in.table_number,
        capacity=table_in.capacity,
        status=table_in.status,
    )
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


@router.get("/reservations", response_model=List[ReservationResponse])
def get_reservations(db: Session = Depends(get_db)):
    reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).all()
    return reservations


@router.post(
    "/reservations",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation(res_in: ReservationCreate, db: Session = Depends(get_db)):
    table = db.query(Table).filter(Table.id == res_in.table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {res_in.table_id} not found",
        )

    # Fetch existing reservations for this table
    existing_reservations = (
        db.query(Reservation).filter(Reservation.table_id == res_in.table_id).all()
    )

    new_dt = _parse_res_time(res_in.reservation_time)

    for existing in existing_reservations:
        # Check exact string match
        if existing.reservation_time == res_in.reservation_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Table {table.table_number} is already reserved for time slot '{res_in.reservation_time}'. Double-booking is not allowed.",
            )

        # Check datetime overlap window
        if new_dt:
            exist_dt = _parse_res_time(existing.reservation_time)
            if exist_dt and _is_overlapping(new_dt, exist_dt, window_minutes=120):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Table {table.table_number} is already reserved at '{existing.reservation_time}', which overlaps with requested time '{res_in.reservation_time}'. Double-booking is not allowed.",
                )

    reservation = Reservation(
        table_id=res_in.table_id,
        customer_name=res_in.customer_name,
        party_size=res_in.party_size,
        reservation_time=res_in.reservation_time,
        notes=res_in.notes,
    )
    db.add(reservation)

    # Update table status to Reserved if it was Available
    if table.status == "Available":
        table.status = "Reserved"

    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/{table_id}", response_model=TableResponse)
def get_table(table_id: str, db: Session = Depends(get_db)):
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Table not found"
        )
    return table


@router.patch("/{table_id}/status", response_model=TableResponse)
@router.put("/{table_id}/status", response_model=TableResponse)
@router.patch("/{table_id}", response_model=TableResponse)
def update_table_status(
    table_id: str, table_in: TableUpdate, db: Session = Depends(get_db)
):
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Table not found"
        )

    if table_in.status:
        valid_statuses = ["Available", "Reserved", "Occupied"]
        if table_in.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid table status '{table_in.status}'. Allowed: {', '.join(valid_statuses)}",
            )
        table.status = table_in.status

    if table_in.capacity:
        table.capacity = table_in.capacity

    db.commit()
    db.refresh(table)
    return table
