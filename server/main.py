import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.routers.auth import router as auth_router
from server.routers.books import router as books_router
from server.routers.cart import router as cart_router
from server.routers.orders import router as orders_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database tables and Seed Data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any


app = FastAPI(
    title="Book Haven E-Commerce API",
    description="RESTful API for Online Book Store catalog, search, shopping cart, checkout, and order history.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(books_router, prefix="/api/v1", tags=["catalog"])
app.include_router(cart_router, prefix="/api/v1/cart", tags=["cart"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])


@app.get("/", tags=["health"])
def root():
    return {
        "message": "Welcome to the Book Haven API",
        "docs_url": "/docs",
        "version": "1.0.0",
        "status": "healthy",
    }


@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "book-website-api", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
