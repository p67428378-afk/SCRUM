import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from server.database import engine, Base, get_db, seed_data
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
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_seller,
)

# Simple in-memory rate limiter for inquiries
# Maps IP address to list of submission timestamps
inquiry_rate_limits = defaultdict(list)
RATE_LIMIT_WINDOW = 900  # 15 minutes in seconds
RATE_LIMIT_MAX_REQUESTS = 5


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed data on startup
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="PurrfectMatch API",
    description="Core Cat Marketplace API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_pw = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role.value,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/v1/auth/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    email = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid login request. Provide email and password.",
        )

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# --- CAT ENDPOINTS ---


@app.get("/api/v1/cats", response_model=CatListResponse)
def list_cats(
    search: Optional[str] = None,
    breed: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Cat)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(Cat.name.ilike(search_filter), Cat.breed.ilike(search_filter))
        )

    if breed and breed != "All Breeds":
        query = query.filter(Cat.breed == breed)

    if gender and gender != "All Genders":
        query = query.filter(Cat.gender == gender)

    if age_group and age_group != "All Ages":
        if age_group == "Kitten":
            query = query.filter(Cat.age_months < 6)
        elif age_group == "Young":
            query = query.filter(Cat.age_months >= 6, Cat.age_months <= 12)
        elif age_group == "Adult":
            query = query.filter(Cat.age_months > 12)

    if min_price is not None:
        query = query.filter(Cat.price >= min_price)

    if max_price is not None:
        query = query.filter(Cat.price <= max_price)

    # Always order by created_at desc for deterministic pagination
    query = query.order_by(Cat.created_at.desc())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {"items": items, "total": total, "skip": skip, "limit": limit}


@app.get("/api/v1/cats/{cat_id}", response_model=CatDetailResponse)
def get_cat(cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(Cat).options(joinedload(Cat.seller)).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )
    return cat


@app.post(
    "/api/v1/cats", response_model=CatResponse, status_code=status.HTTP_201_CREATED
)
def create_cat(
    cat_in: CatCreate,
    current_user: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    db_cat = Cat(
        seller_id=current_user.id,
        name=cat_in.name,
        breed=cat_in.breed,
        age_months=cat_in.age_months,
        gender=cat_in.gender,
        price=cat_in.price,
        description=cat_in.description,
        image_url=cat_in.image_url,
        status="Available",
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat


@app.put("/api/v1/cats/{cat_id}", response_model=CatResponse)
def update_cat(
    cat_id: str,
    cat_in: CatUpdate,
    current_user: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    if cat.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this listing",
        )

    update_data = cat_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cat, key, value)

    db.commit()
    db.refresh(cat)
    return cat


@app.delete("/api/v1/cats/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cat(
    cat_id: str,
    current_user: User = Depends(get_current_seller),
    db: Session = Depends(get_db),
):
    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    if cat.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this listing",
        )

    db.delete(cat)
    db.commit()
    return


# --- INQUIRY ENDPOINTS ---


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
):
    # Rate limiting check
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    # Filter out timestamps older than 15 minutes
    inquiry_rate_limits[client_ip] = [
        t for t in inquiry_rate_limits[client_ip] if now - t < RATE_LIMIT_WINDOW
    ]

    if len(inquiry_rate_limits[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many inquiries. Please try again later.",
        )

    cat = db.query(Cat).filter(Cat.id == cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cat not found"
        )

    # Optional: associate with logged-in buyer if token is present
    buyer_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            from server.auth import get_optional_current_user

            buyer = get_optional_current_user(token, db)
            if buyer:
                buyer_id = buyer.id
        except Exception:
            pass

    db_inquiry = Inquiry(
        cat_id=cat_id,
        buyer_id=buyer_id,
        buyer_name=inquiry_in.buyer_name,
        buyer_email=inquiry_in.buyer_email,
        buyer_phone=inquiry_in.buyer_phone,
        message=inquiry_in.message,
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)

    # Record submission timestamp for rate limiting
    inquiry_rate_limits[client_ip].append(now)

    return db_inquiry


@app.get("/api/v1/inquiries", response_model=List[InquiryDetailResponse])
def list_inquiries(
    current_user: User = Depends(get_current_seller), db: Session = Depends(get_db)
):
    # Sellers must only be able to view inquiries for their own cats
    inquiries = (
        db.query(Inquiry)
        .join(Cat)
        .options(joinedload(Inquiry.cat))
        .filter(Cat.seller_id == current_user.id)
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    return inquiries
