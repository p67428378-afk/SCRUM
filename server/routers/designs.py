import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from server.database import get_db
from server.models import User, DesignPost, MediaAsset, Bookmark
from server.schemas import (
    DesignPostCreate,
    DesignPostUpdate,
    DesignPostOut,
    DesignListResponse,
    MediaAssetOut,
)
from server.auth import get_current_user, require_designer_role

router = APIRouter(prefix="/designs", tags=["Design Posts"])


def format_design_post_out(post: DesignPost, db: Session) -> DesignPostOut:
    bookmark_count = db.query(Bookmark).filter(Bookmark.post_id == post.id).count()
    designer_name = post.designer.full_name if post.designer else "Unknown Designer"

    media_assets = [
        MediaAssetOut(
            id=m.id,
            post_id=m.post_id,
            asset_type=m.asset_type,
            filename=m.filename,
            file_url=m.file_url,
            file_type=m.file_type,
            file_size_bytes=m.file_size_bytes,
            status=m.status,
            created_at=m.created_at,
        )
        for m in post.media_assets
    ]

    return DesignPostOut(
        id=post.id,
        designer_id=post.designer_id,
        designer_name=designer_name,
        title=post.title,
        description=post.description,
        style=post.style,
        layout_size=post.layout_size,
        budget_tier=post.budget_tier,
        color_scheme=post.color_scheme,
        cover_image_url=post.cover_image_url,
        specifications=post.specifications,
        bookmark_count=bookmark_count,
        media_assets=media_assets,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.get("", response_model=DesignListResponse)
def list_design_posts(
    q: Optional[str] = Query(
        None, description="Search keyword in title, description, or style"
    ),
    style: Optional[str] = Query(
        None, description="Filter by style (e.g. Industrial, Minimalist)"
    ),
    layout_size: Optional[str] = Query(None, description="Filter by layout size"),
    budget_tier: Optional[str] = Query(None, description="Filter by budget tier"),
    color_scheme: Optional[str] = Query(None, description="Filter by color scheme"),
    designer_id: Optional[str] = Query(None, description="Filter by designer ID"),
    sort_by: Optional[str] = Query(
        "newest", description="Sort by 'newest', 'oldest', or 'bookmarks'"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search and filter design concepts with multi-select facets and pagination."""
    query = db.query(DesignPost)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                DesignPost.title.ilike(search_pattern),
                DesignPost.description.ilike(search_pattern),
                DesignPost.style.ilike(search_pattern),
                DesignPost.color_scheme.ilike(search_pattern),
            )
        )

    if style:
        styles = [s.strip() for s in style.split(",") if s.strip()]
        if len(styles) == 1:
            query = query.filter(DesignPost.style.ilike(f"%{styles[0]}%"))
        else:
            query = query.filter(
                or_(*[DesignPost.style.ilike(f"%{s}%") for s in styles])
            )

    if layout_size:
        sizes = [s.strip() for s in layout_size.split(",") if s.strip()]
        if len(sizes) == 1:
            query = query.filter(DesignPost.layout_size.ilike(f"%{sizes[0]}%"))
        else:
            query = query.filter(
                or_(*[DesignPost.layout_size.ilike(f"%{s}%") for s in sizes])
            )

    if budget_tier:
        budgets = [b.strip() for b in budget_tier.split(",") if b.strip()]
        if len(budgets) == 1:
            query = query.filter(DesignPost.budget_tier.ilike(f"%{budgets[0]}%"))
        else:
            query = query.filter(
                or_(*[DesignPost.budget_tier.ilike(f"%{b}%") for b in budgets])
            )

    if color_scheme:
        colors = [c.strip() for c in color_scheme.split(",") if c.strip()]
        if len(colors) == 1:
            query = query.filter(DesignPost.color_scheme.ilike(f"%{colors[0]}%"))
        else:
            query = query.filter(
                or_(*[DesignPost.color_scheme.ilike(f"%{c}%") for c in colors])
            )

    if designer_id:
        query = query.filter(DesignPost.designer_id == designer_id)

    total = query.count()

    if sort_by == "oldest":
        query = query.order_by(asc(DesignPost.created_at))
    elif sort_by == "bookmarks":
        # Sort by count of bookmarks
        bookmark_subq = (
            db.query(Bookmark.post_id, func.count(Bookmark.id).label("bm_count"))
            .group_by(Bookmark.post_id)
            .subquery()
        )
        query = query.outerjoin(
            bookmark_subq, DesignPost.id == bookmark_subq.c.post_id
        ).order_by(
            desc(func.coalesce(bookmark_subq.c.bm_count, 0)),
            desc(DesignPost.created_at),
        )
    else:  # 'newest' default
        query = query.order_by(desc(DesignPost.created_at))

    posts = query.offset(skip).limit(limit).all()
    items = [format_design_post_out(p, db) for p in posts]

    return DesignListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=DesignPostOut)
def get_design_post(id: str, db: Session = Depends(get_db)):
    """Retrieve full details of a specific design post."""
    post = db.query(DesignPost).filter(DesignPost.id == id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design post not found",
        )
    return format_design_post_out(post, db)


@router.post("", response_model=DesignPostOut, status_code=status.HTTP_201_CREATED)
def create_design_post(
    payload: DesignPostCreate,
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """Publish a new design post. Requires Designer role."""
    post_id = str(uuid.uuid4())
    post = DesignPost(
        id=post_id,
        designer_id=current_user.id,
        title=payload.title,
        description=payload.description,
        style=payload.style,
        layout_size=payload.layout_size,
        budget_tier=payload.budget_tier,
        color_scheme=payload.color_scheme,
        cover_image_url=payload.cover_image_url,
        specifications=payload.specifications,
    )
    db.add(post)
    db.flush()

    # Link any media assets that were previously uploaded
    if payload.media_asset_ids:
        assets = (
            db.query(MediaAsset)
            .filter(MediaAsset.id.in_(payload.media_asset_ids))
            .all()
        )
        for asset in assets:
            asset.post_id = post_id
            asset.status = "attached"
            # If no cover image was provided, set the first mood board image as cover
            if not post.cover_image_url and asset.asset_type == "mood_board":
                post.cover_image_url = asset.file_url

    db.commit()
    db.refresh(post)
    return format_design_post_out(post, db)


@router.patch("/{id}", response_model=DesignPostOut)
def update_design_post(
    id: str,
    payload: DesignPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing design post. Only the author or admin can update."""
    post = db.query(DesignPost).filter(DesignPost.id == id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design post not found",
        )

    if post.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this design post",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(post, field, val)

    db.commit()
    db.refresh(post)
    return format_design_post_out(post, db)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design_post(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a design post. Only the author or admin can delete."""
    post = db.query(DesignPost).filter(DesignPost.id == id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design post not found",
        )

    if post.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this design post",
        )

    db.delete(post)
    db.commit()
    return None
