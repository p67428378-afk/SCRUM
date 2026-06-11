from typing import List
from sqlalchemy.orm import Session

from server.models.message import Message
from server.schemas.message import MessageCreate

def get_messages_for_rental(db: Session, rental_id: str, skip: int = 0, limit: int = 100) -> List[Message]:
    return db.query(Message).filter(Message.rental_id == rental_id).offset(skip).limit(limit).all()

def create_message(db: Session, message: MessageCreate) -> Message:
    db_message = Message(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
