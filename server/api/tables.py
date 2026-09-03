import uuid
from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from server.database import get_db, seed_data
from server.models import Table, Reservation
from server.schemas import (
    TableCreate,
    TableResponse,
    TableStatusUpdate,
    ReservationCreate,
    ReservationResponse,
)

router = APIRouter(prefix="/api/v1/tables", tags=["Tables & Reservations"])


def find_table(table_identifier: str, db: Session) -> Optional[Table]:
    """Helper to find table by UUID id or integer table_number."""
    table = db.query(Table).filter(Table.id == table_identifier).first()
    if not table and table_identifier.isdigit():
        table = (
            db.query(Table).filter(Table.table_number == int(table_identifier)).first()
        )
    return table


# --- Table Endpoints ---
@router.get("", response_model=List[TableResponse])
def get_tables(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status (Available, Reserved, Occupied)",
    ),
    db: Session = Depends(get_db),
):
    seed_data(db)
    query = db.query(Table)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Table.status.ilike(status_filter))
    return query.order_by(Table.table_number.asc()).all()


@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(table_in: TableCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Table).filter(Table.table_number == table_in.table_number).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table number {table_in.table_number} already exists.",
        )
    db_table = Table(**table_in.model_dump())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table


@router.get("/{table_id}", response_model=TableResponse)
def get_table(table_id: str, db: Session = Depends(get_db)):
    seed_data(db)
    db_table = find_table(table_id, db)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with id or number '{table_id}' not found.",
        )
    return db_table


@router.put("/{table_id}/status", response_model=TableResponse)
def update_table_status(
    table_id: str, status_in: TableStatusUpdate, db: Session = Depends(get_db)
):
    seed_data(db)
    db_table = find_table(table_id, db)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with id or number '{table_id}' not found.",
        )

    valid_statuses = ["Available", "Reserved", "Occupied"]
    matched_status = next(
        (s for s in valid_statuses if s.lower() == status_in.status.lower()), None
    )
    if not matched_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid table status '{status_in.status}'. Allowed: {valid_statuses}",
        )

    db_table.status = matched_status  # type: ignore[assignment]
    db.commit()
    db.refresh(db_table)
    return db_table


# --- Reservation Endpoints ---
@router.get("/reservations", response_model=List[ReservationResponse])
@router.get("/reservations/all", response_model=List[ReservationResponse])
def get_reservations(
    table_id: Optional[str] = Query(None, description="Filter by table ID"),
    db: Session = Depends(get_db),
):
    seed_data(db)
    query = db.query(Reservation)
    if table_id and table_id.lower() != "all":
        query = query.filter(Reservation.table_id == table_id)
    return query.order_by(Reservation.reservation_time.asc()).all()


@router.post(
    "/reservations",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reservation(res_in: ReservationCreate, db: Session = Depends(get_db)):
    seed_data(db)
    db_table = find_table(res_in.table_id, db)
    if not db_table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table '{res_in.table_id}' not found.",
        )

    if res_in.party_size > db_table.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Party size ({res_in.party_size}) exceeds table capacity ({db_table.capacity}).",
        )

    # Double-booking check: Check for active reservations within +/- 2 hours window for the same table
    target_time = res_in.reservation_time
    if target_time.tzinfo is not None:
        target_time = target_time.replace(tzinfo=None)

    window_start = target_time - timedelta(hours=2)
    window_end = target_time + timedelta(hours=2)

    existing_res = (
        db.query(Reservation)
        .filter(
            Reservation.table_id == db_table.id,
            Reservation.status != "Cancelled",
            Reservation.reservation_time >= window_start,
            Reservation.reservation_time <= window_end,
        )
        .first()
    )

    if existing_res:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table {db_table.table_number} is already reserved for an overlapping time slot ({existing_res.reservation_time.isoformat()}).",
        )

    db_res = Reservation(
        id=str(uuid.uuid4()),
        table_id=db_table.id,
        customer_name=res_in.customer_name,
        party_size=res_in.party_size,
        reservation_time=target_time,
        notes=res_in.notes,
        status="Active",
    )
    db.add(db_res)

    if db_table.status == "Available":
        db_table.status = "Reserved"  # type: ignore[assignment]

    db.commit()
    db.refresh(db_res)
    return db_res
