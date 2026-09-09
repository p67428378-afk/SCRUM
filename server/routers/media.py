import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models import User, ActorProfile, MediaAsset
from server.schemas import UploadUrlRequest, UploadUrlResponse, MediaCreate, MediaOut
from server.routers.auth import get_current_user

router = APIRouter(prefix="/api/v1/actors/media", tags=["Media Gallery"])

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
    "application/pdf",
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload-url", response_model=UploadUrlResponse)
def request_upload_url(
    req: UploadUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.file_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{req.file_type}'. Supported types: JPEG, PNG, WEBP, PDF.",
        )

    asset_id = str(uuid.uuid4())
    safe_filename = req.filename.replace(" ", "_")
    public_url = f"https://storage.googleapis.com/sdlc-actor-portfolios-media/uploads/{asset_id}_{safe_filename}"
    upload_url = f"{public_url}?GoogleAccessId=service-account@gcp.iam.gserviceaccount.com&Expires=1700000000&Signature=mock_signature"

    return UploadUrlResponse(
        upload_url=upload_url,
        public_url=public_url,
        asset_id=asset_id,
    )


@router.post("", response_model=MediaOut, status_code=201)
def create_media_asset(
    media_in: MediaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    if media_in.file_size_bytes and media_in.file_size_bytes > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10MB",
        )

    if media_in.is_primary and media_in.asset_type == "headshot":
        # Unset primary flag for other headshots
        db.query(MediaAsset).filter(
            MediaAsset.actor_id == profile.id,
            MediaAsset.asset_type == "headshot",
        ).update({"is_primary": False})

    media = MediaAsset(
        actor_id=profile.id,
        asset_type=media_in.asset_type,
        url=media_in.url,
        title=media_in.title,
        is_primary=media_in.is_primary,
        file_size_bytes=media_in.file_size_bytes,
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    return media


@router.get("", response_model=List[MediaOut])
def list_media_assets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )
    return db.query(MediaAsset).filter(MediaAsset.actor_id == profile.id).all()


@router.put("/{media_id}/primary", response_model=dict)
def set_primary_headshot(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    media = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.id == media_id,
            MediaAsset.actor_id == profile.id,
        )
        .first()
    )
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media asset not found",
        )

    if media.asset_type != "headshot":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only headshots can be marked as primary",
        )

    # Unset primary flag for all headshots of this actor
    db.query(MediaAsset).filter(
        MediaAsset.actor_id == profile.id,
        MediaAsset.asset_type == "headshot",
    ).update({"is_primary": False})

    media.is_primary = True
    db.commit()
    return {"message": "Primary headshot updated successfully"}


@router.delete("/{media_id}", status_code=204)
def delete_media_asset(
    media_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ActorProfile).filter(ActorProfile.user_id == current_user.id).first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor profile not found",
        )

    media = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.id == media_id,
            MediaAsset.actor_id == profile.id,
        )
        .first()
    )
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media asset not found",
        )

    db.delete(media)
    db.commit()
    return None
