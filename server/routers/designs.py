from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from server.database import get_db
from server.models import User, DesignPost, MediaAsset
from server.schemas import (
    DesignPostCreate,
    DesignPostUpdate,
    DesignPostResponse,
    MediaAssetResponse,
)
from server.auth import get_current_user, require_role

router = APIRouter(prefix="/designs", tags=["Designs"])


def serialize_design_post(post: DesignPost) -> DesignPostResponse:
    return DesignPostResponse(
        id=post.id,
        designer_id=post.designer_id,
        designer_name=post.designer.full_name if post.designer else None,
        designer_avatar=post.designer.avatar_url if post.designer else None,
        title=post.title,
        description=post.description,
        style=post.style,
        layout_size=post.layout_size,
        budget_tier=post.budget_tier,
        color_scheme=post.color_scheme,
        bookmark_count=post.bookmark_count or 0,
        cover_image_url=post.cover_image_url,
        media_assets=[MediaAssetResponse.model_validate(m) for m in post.media_assets]
        if post.media_assets
        else [],
        created_at=post.created_at,
    )


@router.get("", response_model=List[DesignPostResponse])
def get_designs(
    q: Optional[str] = Query(
        None, description="Search query across title and description"
    ),
    style: Optional[str] = Query(
        None, description="Filter by style (e.g. Scandinavian, Industrial)"
    ),
    layout_size: Optional[str] = Query(None, description="Filter by layout size"),
    budget_tier: Optional[str] = Query(None, description="Filter by budget tier"),
    color_scheme: Optional[str] = Query(None, description="Filter by color scheme"),
    designer_id: Optional[str] = Query(None, description="Filter by designer ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(DesignPost)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                DesignPost.title.ilike(search_pattern),
                DesignPost.description.ilike(search_pattern),
                DesignPost.style.ilike(search_pattern),
            )
        )

    if style:
        styles = [s.strip() for s in style.split(",") if s.strip()]
        if len(styles) == 1:
            query = query.filter(DesignPost.style.ilike(f"%{styles[0]}%"))
        elif len(styles) > 1:
            query = query.filter(
                or_(*[DesignPost.style.ilike(f"%{s}%") for s in styles])
            )

    if layout_size:
        sizes = [s.strip() for s in layout_size.split(",") if s.strip()]
        if len(sizes) == 1:
            query = query.filter(DesignPost.layout_size.ilike(f"%{sizes[0]}%"))
        elif len(sizes) > 1:
            query = query.filter(
                or_(*[DesignPost.layout_size.ilike(f"%{s}%") for s in sizes])
            )

    if budget_tier:
        budgets = [b.strip() for b in budget_tier.split(",") if b.strip()]
        if len(budgets) == 1:
            query = query.filter(DesignPost.budget_tier.ilike(f"%{budgets[0]}%"))
        elif len(budgets) > 1:
            query = query.filter(
                or_(*[DesignPost.budget_tier.ilike(f"%{b}%") for b in budgets])
            )

    if color_scheme:
        colors = [c.strip() for c in color_scheme.split(",") if c.strip()]
        if len(colors) == 1:
            query = query.filter(DesignPost.color_scheme.ilike(f"%{colors[0]}%"))
        elif len(colors) > 1:
            query = query.filter(
                or_(*[DesignPost.color_scheme.ilike(f"%{c}%") for c in colors])
            )

    if designer_id:
        query = query.filter(DesignPost.designer_id == designer_id)

    posts = query.order_by(DesignPost.created_at.desc()).offset(skip).limit(limit).all()
    return [serialize_design_post(p) for p in posts]


@router.get("/{post_id}", response_model=DesignPostResponse)
def get_design_by_id(post_id: str, db: Session = Depends(get_db)):
    post = db.query(DesignPost).filter(DesignPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Design concept with ID '{post_id}' not found.",
        )
    return serialize_design_post(post)


@router.post("", response_model=DesignPostResponse, status_code=status.HTTP_201_CREATED)
def create_design(
    design_in: DesignPostCreate,
    current_user: User = Depends(require_role(["designer", "admin"])),
    db: Session = Depends(get_db),
):
    post = DesignPost(
        designer_id=current_user.id,
        title=design_in.title,
        description=design_in.description,
        style=design_in.style,
        layout_size=design_in.layout_size,
        budget_tier=design_in.budget_tier,
        color_scheme=design_in.color_scheme,
        cover_image_url=design_in.cover_image_url,
        bookmark_count=0,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Link any media assets provided in create request
    if design_in.media_asset_ids:
        assets = (
            db.query(MediaAsset)
            .filter(MediaAsset.id.in_(design_in.media_asset_ids))
            .all()
        )
        for asset in assets:
            asset.post_id = post.id
            if not post.cover_image_url and asset.asset_type == "mood_board":
                post.cover_image_url = asset.file_url
        db.commit()
        db.refresh(post)

    return serialize_design_post(post)


@router.put("/{post_id}", response_model=DesignPostResponse)
def update_design(
    post_id: str,
    design_in: DesignPostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(DesignPost).filter(DesignPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Design concept with ID '{post_id}' not found.",
        )

    if post.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this design concept.",
        )

    update_data = design_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return serialize_design_post(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(DesignPost).filter(DesignPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Design concept with ID '{post_id}' not found.",
        )

    if post.designer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this design concept.",
        )

    db.delete(post)
    db.commit()
    return None
