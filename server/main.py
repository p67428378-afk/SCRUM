from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import ALLOWED_ORIGINS
from server.database import init_db, seed_data, SessionLocal
from server.routers import auth, products, ingredients, orders, analytics, recipes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB init and seed
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Bakery Management System API",
    description="API for Artisan Bakery POS, Inventory Management, Recipe Formula Mapping, and Analytics.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware (MANDATORY for fullstack integration)
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
app.include_router(ingredients.router)
app.include_router(orders.router)
app.include_router(analytics.router)
app.include_router(recipes.router)


@app.get("/")
def root():
    return {
        "message": "Bakery Management System API is running",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy"}
