import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.config import settings
from server.database import get_db
from server.models import User, DesignPost, MediaAsset
from server.schemas import (
    PresignedUrlRequest,
    PresignedUrlResponse,
    MediaConfirmRequest,
    MediaAssetResponse,
)
from server.auth import get_current_user

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/presigned-url", response_model=PresignedUrlResponse)
def generate_presigned_url(
    req: PresignedUrlRequest,
    current_user: User = Depends(get_current_user),
):
    if req.file_size_bytes > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size {req.file_size_bytes} bytes exceeds 25MB maximum limit.",
        )

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
    ]
    if not any(
        req.file_type.startswith("image/") or req.file_type == "application/pdf"
        for _ in [1]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{req.file_type}'. Supported: images and PDF floor plans/specs.",
        )

    unique_key = f"uploads/{current_user.id}/{uuid.uuid4()}_{req.filename}"
    bucket = settings.S3_BUCKET_NAME
    region = settings.AWS_REGION

    # Construct standard S3 upload and resource endpoints
    upload_url = f"https://{bucket}.s3.{region}.amazonaws.com/{unique_key}?X-Amz-Expires={settings.PRESIGNED_URL_EXPIRE_SECONDS}"
    file_url = f"https://{bucket}.s3.{region}.amazonaws.com/{unique_key}"

    return PresignedUrlResponse(
        upload_url=upload_url,
        file_url=file_url,
        asset_type=req.asset_type,
        expires_in_seconds=settings.PRESIGNED_URL_EXPIRE_SECONDS,
    )


@router.post(
    "/confirm", response_model=MediaAssetResponse, status_code=status.HTTP_201_CREATED
)
def confirm_media_upload(
    req: MediaConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.file_size_bytes > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 25MB maximum limit.",
        )

    post = None
    if req.post_id:
        post = db.query(DesignPost).filter(DesignPost.id == req.post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated design post '{req.post_id}' not found.",
            )

    media_asset = MediaAsset(
        post_id=req.post_id,
        asset_type=req.asset_type,
        file_name=req.file_name,
        file_url=req.file_url,
        file_size_bytes=req.file_size_bytes,
        mime_type=req.mime_type,
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)

    if (
        post
        and not post.cover_image_url
        and (req.asset_type == "mood_board" or req.mime_type.startswith("image/"))
    ):
        post.cover_image_url = req.file_url
        db.commit()

    return MediaAssetResponse.model_validate(media_asset)


@router.get("/{asset_id}", response_model=MediaAssetResponse)
def get_media_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Media asset '{asset_id}' not found.",
        )
    return MediaAssetResponse.model_validate(asset)
