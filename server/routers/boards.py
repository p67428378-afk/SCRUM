import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from server.database import get_db
from server.models import User, ProjectBoard, Bookmark, DesignPost
from server.schemas import (
    ProjectBoardCreate,
    ProjectBoardUpdate,
    ProjectBoardOut,
    ProjectBoardListResponse,
    BookmarkCreate,
    BookmarkOut,
)
from server.auth import get_current_user, get_optional_current_user
from server.routers.designs import format_design_post_out

router = APIRouter(prefix="/boards", tags=["Project Boards & Bookmarks"])


def format_board_out(
    board: ProjectBoard, db: Session, include_bookmarks: bool = False
) -> ProjectBoardOut:
    bm_query = db.query(Bookmark).filter(Bookmark.board_id == board.id)
    bookmark_count = bm_query.count()

    bookmarks_list = None
    if include_bookmarks:
        bms = bm_query.order_by(desc(Bookmark.created_at)).all()
        bookmarks_list = []
        for bm in bms:
            post_out = format_design_post_out(bm.post, db) if bm.post else None
            bookmarks_list.append(
                BookmarkOut(
                    id=bm.id,
                    board_id=bm.board_id,
                    post_id=bm.post_id,
                    post=post_out,
                    created_at=bm.created_at,
                )
            )

    return ProjectBoardOut(
        id=board.id,
        user_id=board.user_id,
        name=board.name,
        description=board.description,
        is_private=board.is_private,
        bookmark_count=bookmark_count,
        bookmarks=bookmarks_list,
        created_at=board.created_at,
        updated_at=board.updated_at,
    )


@router.get("", response_model=ProjectBoardListResponse)
def list_project_boards(
    public_only: bool = Query(
        False, description="Filter only public boards across all users"
    ),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Fetch project boards. If authenticated, defaults to user's boards unless public_only is set."""
    query = db.query(ProjectBoard)

    if public_only:
        query = query.filter(ProjectBoard.is_private.is_(False))
    elif current_user:
        # Show current user's boards
        query = query.filter(ProjectBoard.user_id == current_user.id)
    else:
        # Anonymous user without public_only defaults to public boards
        query = query.filter(ProjectBoard.is_private.is_(False))

    boards = query.order_by(desc(ProjectBoard.created_at)).all()
    items = [format_board_out(b, db, include_bookmarks=False) for b in boards]
    return ProjectBoardListResponse(items=items, total=len(items))


@router.post("", response_model=ProjectBoardOut, status_code=status.HTTP_201_CREATED)
def create_project_board(
    payload: ProjectBoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a custom project board with private/public visibility."""
    board = ProjectBoard(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        is_private=payload.is_private,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return format_board_out(board, db, include_bookmarks=True)


@router.get("/{id}", response_model=ProjectBoardOut)
def get_project_board(
    id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve details and bookmarked concepts for a specific board."""
    board = db.query(ProjectBoard).filter(ProjectBoard.id == id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project board not found",
        )

    # Privacy check
    if board.is_private:
        if not current_user or (
            board.user_id != current_user.id and current_user.role != "admin"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This board is private. Access denied.",
            )

    return format_board_out(board, db, include_bookmarks=True)


@router.patch("/{id}", response_model=ProjectBoardOut)
def update_project_board(
    id: str,
    payload: ProjectBoardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update project board name, description, or visibility."""
    board = db.query(ProjectBoard).filter(ProjectBoard.id == id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project board not found",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this board",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(board, field, val)

    db.commit()
    db.refresh(board)
    return format_board_out(board, db, include_bookmarks=True)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_board(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a project board."""
    board = db.query(ProjectBoard).filter(ProjectBoard.id == id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project board not found",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this board",
        )

    db.delete(board)
    db.commit()
    return None


@router.post(
    "/{id}/bookmarks", response_model=BookmarkOut, status_code=status.HTTP_201_CREATED
)
def add_bookmark_to_board(
    id: str,
    payload: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Idempotently bookmark a design post to a board."""
    board = db.query(ProjectBoard).filter(ProjectBoard.id == id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project board not found",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this board",
        )

    # Check design post exists
    post = db.query(DesignPost).filter(DesignPost.id == payload.post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design post not found",
        )

    # Check if already bookmarked (idempotent)
    existing_bm = (
        db.query(Bookmark)
        .filter(Bookmark.board_id == id, Bookmark.post_id == payload.post_id)
        .first()
    )
    if existing_bm:
        post_out = format_design_post_out(post, db)
        return BookmarkOut(
            id=existing_bm.id,
            board_id=existing_bm.board_id,
            post_id=existing_bm.post_id,
            post=post_out,
            created_at=existing_bm.created_at,
        )

    new_bm = Bookmark(
        id=str(uuid.uuid4()),
        board_id=id,
        post_id=payload.post_id,
    )
    db.add(new_bm)
    db.commit()
    db.refresh(new_bm)

    post_out = format_design_post_out(post, db)
    return BookmarkOut(
        id=new_bm.id,
        board_id=new_bm.board_id,
        post_id=new_bm.post_id,
        post=post_out,
        created_at=new_bm.created_at,
    )


@router.delete("/{id}/bookmarks/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_bookmark_from_board(
    id: str,
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a bookmarked design post from a project board."""
    board = db.query(ProjectBoard).filter(ProjectBoard.id == id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project board not found",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this board",
        )

    bm = (
        db.query(Bookmark)
        .filter(Bookmark.board_id == id, Bookmark.post_id == post_id)
        .first()
    )
    if bm:
        db.delete(bm)
        db.commit()

    return None
