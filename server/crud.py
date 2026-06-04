
from sqlalchemy.orm import Session
from . import models, schemas
from sqlalchemy import desc, asc
import uuid

def get_announcements(db: Session, skip: int = 0, limit: int = 100, category: str = None, sort_by: str = None, order: str = None):
    query = db.query(models.Announcement)
    if category:
        query = query.filter(models.Announcement.category == category)
    
    if sort_by:
        if order == "desc":
            query = query.order_by(desc(sort_by))
        else:
            query = query.order_by(asc(sort_by))
    else:
        query = query.order_by(desc(models.Announcement.publication_date))
        
    return query.offset(skip).limit(limit).all()

def get_announcement(db: Session, announcement_id: uuid.UUID):
    return db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()

def get_events(db: Session, skip: int = 0, limit: int = 100, category: str = None, sort_by: str = None, order: str = None):
    query = db.query(models.Event)
    if category:
        query = query.filter(models.Event.category == category)
    
    if sort_by:
        if order == "desc":
            query = query.order_by(desc(sort_by))
        else:
            query = query.order_by(asc(sort_by))
    else:
        query = query.order_by(asc(models.Event.event_date))

    return query.offset(skip).limit(limit).all()

def get_event(db: Session, event_id: uuid.UUID):
    return db.query(models.Event).filter(models.Event.id == event_id).first()
