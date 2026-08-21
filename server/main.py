import os
import time
from contextlib import asynccontextmanager
from typing import Optional, List, Dict
from collections import defaultdict

from fastapi import FastAPI, Depends, HTTPException, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from server.database import get_db, init_db, seed_data, SessionLocal
from server.models import User, Cat, Inquiry
from server.schemas import (
    UserCreate,
    UserResponse,
    Token,
    CatCreate,
    CatUpdate,
    CatResponse,
    CatDetailResponse,
    CatListResponse,
    InquiryCreate,
    InquiryResponse,
    InquiryDetailResponse,
)
from server.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_current_seller,
    get_optional_current_user,
)


# Simple in-memory rate limiter for inquiries
# { ip_address: [timestamp1, timestamp2, ...] }
inquiry_rate_limit_store: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 900  # 15 minutes
RATE_LIMIT_MAX_REQUESTS = 5


def check_inquiry_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    # Filter out timestamps older than window
    inquiry_rate_limit_store[client_ip] = [
        ts
        for ts in inquiry_rate_limit_store[client_ip]
        if now - ts < RATE_LIMIT_WINDOW_SECONDS
    ]
    if len(inquiry_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Maximum 5 inquiries per 15 minutes.",
        )
    inquiry_rate_limit_store[client_ip].append(now)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Core Cat Marketplace API",
    version="1.0.0",
    description="API for Cat Listings, Search, and Buyer-Seller Inquiries",
    lifespan=lifespan,
)

# CORS Middleware
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- AUTH ENDPOINTS ---


@app.post(
    "/api/v1/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/v1/auth/login", response_model=Token)
async def login_user(
    request: Request,
    db: Session = Depends(get_db),
):
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        email = body.get("email") or body.get("username")
        password = body.get("password")
    else:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@app.get("/api/v1/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# --- CATS ENDPOINTS ---


@app.get("/api/v1/cats", response_model=CatListResponse)
def list_cats(
    breed: Optional[str] = Query(None, description="Filter by breed"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    age_group: Optional[str] = Query(
        None, description="Age group: Kitten (<6m), Young (6-12m), Adult (>12m)"
    ),
    search: Optional[str] = Query(None, description="Text search on cat name or breed"),
    status_filter: Optional[str] = Query(
        "Available", alias="status", description="Filter by status (Available/Sold)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Cat)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Cat.status == status_filter)

    if breed:
        query = query.filter(Cat.breed.ilike(f"%{breed}%"))

    if gender:
        query = query.filter(Cat.gender.ilike(gender))

    if min_price is not None:
        query = query.filter(Cat.price >= min_price)

    if max_price is not None:
        query = query.filter(Cat.price <= max_price)

    if age_group:
        ag_lower = age_group.lower()
        if "kitten" in ag_lower:
            query = query.filter(Cat.age_months < 6)
        elif "young" in ag_lower:
            query = query.filter(Cat.age_months >= 6, Cat.age_months <= 12)
        elif "adult" in ag_lower:
            query = query.filter(Cat.age_months > 12)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(Cat.name.ilike(search_pattern), Cat.breed.ilike(search_pattern))
        )

    total = query.count()
    cats = query.order_by(Cat.created_at.desc()).offset(skip).limit(limit).all()

    items = [CatResponse.model_validate(cat) for cat in cats]
    return CatListResponse(items=items, total=total, skip=skip, limit=limit)


@app.get("/api/v1/cats/{cat_id}", response_model=CatDetailResponse)
def get_cat_detail(cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(Cat).options(joinedload(Cat.seller)).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )
    return cat


@app.post(
    "/api/v1/cats",
    response_model=CatResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_cat_listing(
    cat_in: CatCreate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    cat = Cat(
        seller_id=current_seller.id,
        name=cat_in.name,
        breed=cat_in.breed,
        age_months=cat_in.age_months,
        gender=cat_in.gender,
        price=cat_in.price,
        description=cat_in.description,
        image_url=cat_in.image_url,
        status="Available",
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@app.put("/api/v1/cats/{cat_id}", response_model=CatResponse)
def update_cat_listing(
    cat_id: str,
    cat_in: CatUpdate,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    if cat.seller_id != current_seller.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own listings",
        )

    update_data = cat_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cat, field, value)

    db.commit()
    db.refresh(cat)
    return cat


@app.delete("/api/v1/cats/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cat_listing(
    cat_id: str,
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    if cat.seller_id != current_seller.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own listings",
        )

    db.delete(cat)
    db.commit()
    return None


# --- INQUIRIES ENDPOINTS ---


@app.post(
    "/api/v1/cats/{cat_id}/inquiries",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inquiry(
    cat_id: str,
    inquiry_in: InquiryCreate,
    request: Request,
    db: Session = Depends(get_db),
    optional_user: Optional[User] = Depends(get_optional_current_user),
):
    check_inquiry_rate_limit(request)

    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    buyer_id = optional_user.id if optional_user else None

    inquiry = Inquiry(
        cat_id=cat.id,
        buyer_id=buyer_id,
        buyer_name=inquiry_in.buyer_name,
        buyer_email=inquiry_in.buyer_email,
        buyer_phone=inquiry_in.buyer_phone,
        message=inquiry_in.message,
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return inquiry


@app.get("/api/v1/inquiries", response_model=List[InquiryDetailResponse])
def list_seller_inquiries(
    current_seller: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    inquiries = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.cat))
        .join(Cat)
        .filter(Cat.seller_id == current_seller.id)
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    return [InquiryDetailResponse.model_validate(inquiry) for inquiry in inquiries]
