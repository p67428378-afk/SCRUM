from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.config import settings
from server.database import init_db, seed_data, SessionLocal
from server.routers import search_router, products_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware configuration
allowed_origins_list = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list
    or ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "version": settings.VERSION}


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to ShopperHub Search API", "health": "/health"}
