import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import SessionLocal, init_db, seed_data
from server.api.menu import router as menu_router
from server.api.orders import router as orders_router
from server.api.tables import router as tables_router
from server.api.dashboard import router as dashboard_router


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
    title="Cafe Management System Portal API",
    description="RESTful API services for menu management, live order queue, table reservations, and dashboard analytics.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware setup
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

# Include Routers
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(tables_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "Welcome to Cafe Management System Portal API", "docs": "/docs"}


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok", "service": "cafe-management-api"}
