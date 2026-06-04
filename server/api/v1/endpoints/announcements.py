
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from server import crud, models, schemas
from server.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.AnnouncementSummary])
def read_announcements(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None, 
    sort_by: Optional[str] = None, 
    order: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    announcements = crud.get_announcements(db, skip=skip, limit=limit, category=category, sort_by=sort_by, order=order)
    if not announcements:
        raise HTTPException(status_code=404, detail="No announcements found")
    return announcements

@router.get("/{id}", response_model=schemas.Announcement)
def read_single_announcement_by_id(id: uuid.UUID, db: Session = Depends(get_db)):
    db_announcement = crud.get_announcement(db, announcement_id=id)
    if db_announcement is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return db_announcement
