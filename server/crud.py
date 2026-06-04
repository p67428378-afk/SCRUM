
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from . import models, schemas
import uuid

def get_announcements(db: Session, skip: int = 0, limit: int = 10, category: str = None, sort_by: str = 'publication_date', order: str = 'desc'):
    query = db.query(models.Announcement)
    if category:
        query = query.filter(models.Announcement.category == category)
    
    sort_column = getattr(models.Announcement, sort_by, None)
    if sort_column:
        if order.lower() == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
            
    return query.offset(skip).limit(limit).all()

def get_announcement(db: Session, announcement_id: uuid.UUID):
    return db.query(models.Announcement).filter(models.Announcement.id == announcement_id).first()

def get_events(db: Session, skip: int = 0, limit: int = 10, category: str = None, sort_by: str = 'event_date', order: str = 'desc'):
    query = db.query(models.Event)
    if category:
        query = query.filter(models.Event.category == category)

    sort_column = getattr(models.Event, sort_by, None)
    if sort_column:
        if order.lower() == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))

    return query.offset(skip).limit(limit).all()

def get_event(db: Session, event_id: uuid.UUID):
    return db.query(models.Event).filter(models.Event.id == event_id).first()
