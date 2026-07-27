import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.banking import Message
from server.models.user import User
from server.routers.banking import get_current_user
from server.schemas.banking import (
    MessageCreateRequest,
    MessageResponse,
    MessageUpdateRequest,
)

router = APIRouter(prefix="/api/v1/messages", tags=["messages"])


@router.get("", response_model=list[MessageResponse])
def list_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(Message.user_id == current_user.id)
        .order_by(Message.created_at.desc())
        .all()
    )
    return messages


@router.get("/{id}", response_model=MessageResponse)
def get_message(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(Message)
        .filter(Message.id == id, Message.user_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    return msg


@router.post("", response_model=MessageResponse)
def send_message(
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = current_user.id
    sender_name = "User"

    if payload.recipient_username:
        recipient = (
            db.query(User).filter(User.username == payload.recipient_username).first()
        )
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient user not found",
            )
        target_user_id = recipient.id
        sender_name = current_user.username

    msg = Message(
        id=uuid.uuid4(),
        user_id=target_user_id,
        sender=sender_name,
        subject=payload.subject,
        body=payload.body,
        is_read=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.put("/{id}", response_model=MessageResponse)
def mark_message_as_read(
    id: UUID,
    payload: MessageUpdateRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = (
        db.query(Message)
        .filter(Message.id == id, Message.user_id == current_user.id)
        .first()
    )
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    if payload is not None:
        msg.is_read = payload.is_read
    else:
        msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg
