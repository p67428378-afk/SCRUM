import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data
from server.middleware.logging_middleware import LoggingMiddleware
from server.routers import (
    auth,
    products,
    cart,
    wishlist,
    orders,
    rewards,
    activity,
    reviews,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema and seed data idempotently
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="E-Commerce API",
    version="1.0.0",
    description="E-Commerce API with Wishlist, Loyalty Rewards, and Product Reviews",
    lifespan=lifespan,
)

# Mandatory CORS Middleware
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

# Logging Middleware
app.add_middleware(LoggingMiddleware)

# Register Routers under both /api/v1/auth and /api/v1/users for auth
app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(auth.router, prefix="/api/v1/users")

app.include_router(products.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(rewards.router)
app.include_router(activity.router)
app.include_router(reviews.router)


@app.get("/")
def root():
    return {"message": "E-Commerce API is running"}
