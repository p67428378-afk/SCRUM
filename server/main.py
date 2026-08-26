import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, products, cart, orders, wishlist


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize tables and seed initial data idempotently
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed


app = FastAPI(
    title="Furniture Selling Portal API",
    description="RESTful API for e-commerce furniture discovery, customization, cart management, checkout, and order tracking.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS Middleware
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(wishlist.router)


@app.get("/health", tags=["system"])
def health_check():
    return {
        "status": "healthy",
        "service": "furniture-selling-portal",
        "version": "1.0.0",
    }


@app.get("/", tags=["system"])
def root():
    return {
        "message": "Welcome to Furniture Selling Portal API",
        "docs_url": "/docs",
        "health_url": "/health",
        "api_v1_prefix": "/api/v1",
    }
