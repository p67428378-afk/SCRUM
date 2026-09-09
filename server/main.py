from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.config import settings
from server.database import get_db, init_db
from server.schemas import (
    CreditListResponse,
    MediaAssetListResponse,
    ContactInquiryCreate,
    ContactInquiryResponse,
)
from server.services import get_credits, get_gallery_assets, create_contact_inquiry


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed initial data
    init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Setup CORS
allowed_origins_list = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Welcome to Actress Portfolio API", "version": settings.VERSION}


@app.get("/api/v1/credits", response_model=CreditListResponse)
def list_credits(
    category: Optional[str] = Query(
        None, description="Category filter (film, television, theater, commercials)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, credits_list = get_credits(db, category=category, skip=skip, limit=limit)
    return CreditListResponse(total=total, credits=credits_list)


@app.get("/api/v1/gallery", response_model=MediaAssetListResponse)
def list_gallery(
    media_type: Optional[str] = Query(
        None, description="Media type filter (headshot, reel, press_kit)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total, assets_list = get_gallery_assets(
        db, media_type=media_type, skip=skip, limit=limit
    )
    return MediaAssetListResponse(total=total, assets=assets_list)


@app.post(
    "/api/v1/contact",
    response_model=ContactInquiryResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_contact_inquiry(
    inquiry_in: ContactInquiryCreate,
    db: Session = Depends(get_db),
):
    try:
        inquiry = create_contact_inquiry(db, inquiry_in)
        return ContactInquiryResponse(
            status="success",
            inquiry_id=inquiry.id,
            message="Thank you for your inquiry. A confirmation has been sent.",
            submitted_at=inquiry.created_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit inquiry: {str(e)}",
        )
