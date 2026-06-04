
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from server import crud, schemas
from server.database import get_db

router = APIRouter()

@router.get("/events", response_model=List[schemas.Event])
def read_events(
    skip: int = 0, 
    limit: int = 10, 
    category: str = None, 
    sort_by: str = 'event_date', 
    order: str = 'desc', 
    db: Session = Depends(get_db)
):
    events = crud.get_events(db, skip=skip, limit=limit, category=category, sort_by=sort_by, order=order)
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
    return events

@router.get("/events/{id}", response_model=schemas.Event)
def read_event(id: str, db: Session = Depends(get_db)):
    db_event = crud.get_event(db, event_id=id)
    if db_event is None:
        raise HTTPException(status_code=44, detail="Event not found")
    return db_event
