from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ProjectBoard, Bookmark, DesignPost
from server.schemas import (
    ProjectBoardCreate,
    ProjectBoardResponse,
    BookmarkCreate,
    BookmarkResponse,
    DesignPostResponse,
    MediaAssetResponse,
)
from server.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/boards", tags=["Project Boards"])


def serialize_bookmark(bm: Bookmark) -> BookmarkResponse:
    post_res = None
    if bm.post:
        post_res = DesignPostResponse(
            id=bm.post.id,
            designer_id=bm.post.designer_id,
            designer_name=bm.post.designer.full_name if bm.post.designer else None,
            designer_avatar=bm.post.designer.avatar_url if bm.post.designer else None,
            title=bm.post.title,
            description=bm.post.description,
            style=bm.post.style,
            layout_size=bm.post.layout_size,
            budget_tier=bm.post.budget_tier,
            color_scheme=bm.post.color_scheme,
            bookmark_count=bm.post.bookmark_count or 0,
            cover_image_url=bm.post.cover_image_url,
            media_assets=[
                MediaAssetResponse.model_validate(m) for m in bm.post.media_assets
            ]
            if bm.post.media_assets
            else [],
            created_at=bm.post.created_at,
        )
    return BookmarkResponse(
        id=bm.id,
        board_id=bm.board_id,
        post_id=bm.post_id,
        created_at=bm.created_at,
        post=post_res,
    )


def serialize_board(
    board: ProjectBoard, include_bookmarks: bool = True
) -> ProjectBoardResponse:
    bms = (
        [serialize_bookmark(b) for b in board.bookmarks]
        if include_bookmarks and board.bookmarks
        else []
    )
    return ProjectBoardResponse(
        id=board.id,
        user_id=board.user_id,
        name=board.name,
        description=board.description,
        is_private=board.is_private,
        bookmark_count=len(board.bookmarks) if board.bookmarks else 0,
        bookmarks=bms if include_bookmarks else None,
        created_at=board.created_at,
    )


@router.get("", response_model=List[ProjectBoardResponse])
def get_boards(
    all_public: bool = Query(False, description="Fetch all public boards across users"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    if all_public:
        boards = (
            db.query(ProjectBoard)
            .filter(ProjectBoard.is_private == False)
            .order_by(ProjectBoard.created_at.desc())
            .all()
        )
    elif current_user:
        # Return user's boards + other public boards
        boards = (
            db.query(ProjectBoard)
            .filter(
                (ProjectBoard.user_id == current_user.id)
                | (ProjectBoard.is_private == False)
            )
            .order_by(ProjectBoard.created_at.desc())
            .all()
        )
    else:
        # Public boards only
        boards = (
            db.query(ProjectBoard)
            .filter(ProjectBoard.is_private == False)
            .order_by(ProjectBoard.created_at.desc())
            .all()
        )

    return [serialize_board(b, include_bookmarks=False) for b in boards]


@router.post(
    "", response_model=ProjectBoardResponse, status_code=status.HTTP_201_CREATED
)
def create_board(
    board_in: ProjectBoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = ProjectBoard(
        user_id=current_user.id,
        name=board_in.name,
        description=board_in.description,
        is_private=board_in.is_private,
    )
    db.add(board)
    db.commit()
    db.refresh(board)
    return serialize_board(board, include_bookmarks=True)


@router.get("/{board_id}", response_model=ProjectBoardResponse)
def get_board(
    board_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    board = db.query(ProjectBoard).filter(ProjectBoard.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project board '{board_id}' not found.",
        )

    if board.is_private:
        if not current_user or (
            current_user.id != board.user_id and current_user.role != "admin"
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This board is private and can only be viewed by its creator.",
            )

    return serialize_board(board, include_bookmarks=True)


@router.put("/{board_id}", response_model=ProjectBoardResponse)
def update_board(
    board_id: str,
    board_in: ProjectBoardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(ProjectBoard).filter(ProjectBoard.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project board '{board_id}' not found.",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this board.",
        )

    board.name = board_in.name
    board.description = board_in.description
    board.is_private = board_in.is_private
    db.commit()
    db.refresh(board)
    return serialize_board(board, include_bookmarks=True)


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(ProjectBoard).filter(ProjectBoard.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project board '{board_id}' not found.",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this board.",
        )

    db.delete(board)
    db.commit()
    return None


@router.post(
    "/{board_id}/bookmarks",
    response_model=BookmarkResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_bookmark(
    board_id: str,
    bookmark_in: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(ProjectBoard).filter(ProjectBoard.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project board '{board_id}' not found.",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only add bookmarks to your own project boards.",
        )

    post = db.query(DesignPost).filter(DesignPost.id == bookmark_in.post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Design post '{bookmark_in.post_id}' not found.",
        )

    existing_bm = (
        db.query(Bookmark)
        .filter(Bookmark.board_id == board_id, Bookmark.post_id == bookmark_in.post_id)
        .first()
    )

    if existing_bm:
        return serialize_bookmark(existing_bm)

    bm = Bookmark(board_id=board_id, post_id=bookmark_in.post_id)
    db.add(bm)
    post.bookmark_count = (post.bookmark_count or 0) + 1
    db.commit()
    db.refresh(bm)
    return serialize_bookmark(bm)


@router.delete(
    "/{board_id}/bookmarks/{post_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_bookmark(
    board_id: str,
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    board = db.query(ProjectBoard).filter(ProjectBoard.id == board_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project board '{board_id}' not found.",
        )

    if board.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove bookmarks from your own boards.",
        )

    bm = (
        db.query(Bookmark)
        .filter(Bookmark.board_id == board_id, Bookmark.post_id == post_id)
        .first()
    )
    if bm:
        post = db.query(DesignPost).filter(DesignPost.id == post_id).first()
        if post and post.bookmark_count > 0:
            post.bookmark_count -= 1
        db.delete(bm)
        db.commit()

    return None
