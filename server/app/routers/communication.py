"""
Module: routers.communication
Purpose: API router for Announcements and Discussions
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from server.app.database import get_db
from server.app.models.communication import Announcement, Discussion, Comment
from server.app.models.resident import Resident
from server.app.schemas.communication import (
    AnnouncementResponse,
    DiscussionResponse,
    CommentCreate,
    CommentResponse,
)

router = APIRouter(prefix="/api/v1", tags=["communication"])


@router.get("/announcements", response_model=List[AnnouncementResponse])
def get_announcements(db: Session = Depends(get_db)):
    """
    Get announcements.
    """
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.get("/discussions", response_model=List[DiscussionResponse])
def get_discussions(db: Session = Depends(get_db)):
    """
    Get discussion forums.
    """
    discussions = (
        db.query(Discussion)
        .options(joinedload(Discussion.resident))
        .order_by(Discussion.created_at.desc())
        .all()
    )

    response = []
    for d in discussions:
        comments_count = db.query(Comment).filter(Comment.discussion_id == d.id).count()
        response.append(
            {
                "id": d.id,
                "resident_id": d.resident_id,
                "resident_name": d.resident.name if d.resident else "Unknown",
                "title": d.title,
                "content": d.content,
                "comments_count": comments_count,
                "created_at": d.created_at,
            }
        )
    return response


@router.post(
    "/discussions/{id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_comment(id: str, payload: CommentCreate, db: Session = Depends(get_db)):
    """
    Post a comment in a discussion.
    """
    discussion = db.query(Discussion).filter(Discussion.id == id).first()
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found"
        )

    resident = db.query(Resident).filter(Resident.id == payload.resident_id).first()
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Resident not found"
        )

    try:
        new_comment = Comment(
            discussion_id=id, resident_id=payload.resident_id, content=payload.content
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)

        return {
            "id": new_comment.id,
            "discussion_id": new_comment.discussion_id,
            "resident_id": new_comment.resident_id,
            "resident_name": resident.name,
            "content": new_comment.content,
            "created_at": new_comment.created_at,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
