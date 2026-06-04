
import uuid
from sqlalchemy.orm import Session
from . import models, schemas

def get_announcement(db: Session, announcement_id: str):
    """
    Retrieves a single announcement by its ID.
    Converts the string ID to a UUID object for database querying.
    """
    try:
        announcement_uuid = uuid.UUID(announcement_id)
    except ValueError:
        return None
    return db.query(models.Announcement).filter(models.Announcement.id == announcement_uuid).first()

def get_announcements(db: Session, skip: int = 0, limit: int = 100, category: str = None, sort_by: str = 'publication_date', order: str = 'desc'):
    """
    Retrieves a paginated list of announcements, with optional filtering and sorting.
    """
    query = db.query(models.Announcement)
    if category:
        query = query.filter(models.Announcement.category == category)
    
    sort_column = getattr(models.Announcement, sort_by, models.Announcement.publication_date)
    if order.lower() == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())
        
    return query.offset(skip).limit(limit).all()

def get_event(db: Session, event_id: str):
    """
    Retrieves a single event by its ID.
    Converts the string ID to a UUID object for database querying.
    """
    try:
        event_uuid = uuid.UUID(event_id)
    except ValueError:
        return None
    return db.query(models.Event).filter(models.Event.id == event_uuid).first()

def get_events(db: Session, skip: int = 0, limit: int = 100, category: str = None, sort_by: str = 'event_date', order: str = 'desc'):
    """
    Retrieves a paginated list of events, with optional filtering and sorting.
    """
    query = db.query(models.Event)
    if category:
        query = query.filter(models.Event.category == category)

    sort_column = getattr(models.Event, sort_by, models.Event.event_date)
    if order.lower() == 'asc':
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    return query.offset(skip).limit(limit).all()
