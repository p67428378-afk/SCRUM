from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

from server.app.config import settings
from server.app.database import init_db, SessionLocal, seed_data
from server.app.api.v1.endpoints import properties, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB initialization & seeding
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware for full-stack integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
