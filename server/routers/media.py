import uuid
import time
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.config import settings
from server.database import get_db
from server.models import User, MediaAsset, DesignPost
from server.schemas import (
    PresignedUrlRequest,
    PresignedUrlResponse,
    MediaConfirmRequest,
    MediaAssetOut,
)
from server.auth import require_designer_role

router = APIRouter(prefix="/media", tags=["Media Assets & Uploads"])

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "application/pdf",
    "application/octet-stream",
}


@router.post(
    "/presigned-url",
    response_model=PresignedUrlResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_presigned_upload_url(
    payload: PresignedUrlRequest,
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """Request a 15-minute presigned PUT URL for direct S3 asset upload."""
    # 1. Validate file size constraint (<= 25MB)
    if payload.file_size_bytes > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB",
        )

    # 2. Validate MIME type
    clean_mime = payload.file_type.lower().split(";")[0].strip()
    if clean_mime not in ALLOWED_MIME_TYPES and not clean_mime.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{payload.file_type}'. Allowed types: images (JPEG, PNG, WebP) and PDF specifications.",
        )

    # 3. Create storage key & unique ID
    asset_id = str(uuid.uuid4())
    safe_filename = quote(payload.filename.replace(" ", "_"))
    timestamp = int(time.time())
    storage_key = (
        f"designs/{current_user.id}/{timestamp}_{asset_id[:8]}_{safe_filename}"
    )

    # 4. Construct S3 upload URL and public CDN/file URL
    # Simulated/Deterministic S3 URL with 15-minute signature parameter
    expires_in = settings.PRESIGNED_URL_EXPIRATION_SECONDS
    upload_url = (
        f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{storage_key}"
        f"?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires={expires_in}&X-Amz-SignedHeaders=host"
    )
    file_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{storage_key}"

    # 5. Persist pending MediaAsset entry
    media_asset = MediaAsset(
        id=asset_id,
        post_id=None,
        asset_type=payload.asset_type,
        filename=payload.filename,
        file_url=file_url,
        file_type=clean_mime,
        file_size_bytes=payload.file_size_bytes,
        status="pending",
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)

    return PresignedUrlResponse(
        upload_url=upload_url,
        media_asset_id=asset_id,
        key=storage_key,
        file_url=file_url,
        expires_in=expires_in,
        asset_type=payload.asset_type,
    )


@router.post("/confirm", response_model=MediaAssetOut)
def confirm_media_upload(
    payload: MediaConfirmRequest,
    current_user: User = Depends(require_designer_role),
    db: Session = Depends(get_db),
):
    """Confirm successful S3 upload and link asset to design post."""
    asset = db.query(MediaAsset).filter(MediaAsset.id == payload.media_asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media asset not found",
        )

    if payload.post_id:
        post = db.query(DesignPost).filter(DesignPost.id == payload.post_id).first()
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Design post not found",
            )
        if post.designer_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to attach assets to this design post",
            )
        asset.post_id = payload.post_id
        asset.status = "attached"
    else:
        asset.status = "uploaded"

    db.commit()
    db.refresh(asset)
    return asset


@router.get("/{id}", response_model=MediaAssetOut)
def get_media_asset(id: str, db: Session = Depends(get_db)):
    """Retrieve details for a media asset."""
    asset = db.query(MediaAsset).filter(MediaAsset.id == id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media asset not found",
        )
    return asset
