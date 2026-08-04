import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db
from server.routers import items, inventory, adjustments, alerts, warehouses, categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed initial data
    init_db()
    yield


app = FastAPI(
    title="Inventory Management System API",
    description="API for managing inventory stock levels, catalog items, stock adjustments, and low-stock alerts.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(items.router, prefix="/api/v1", tags=["Items"])
app.include_router(inventory.router, prefix="/api/v1", tags=["Inventory"])
app.include_router(adjustments.router, prefix="/api/v1", tags=["Stock Adjustments"])
app.include_router(alerts.router, prefix="/api/v1", tags=["Alerts"])
app.include_router(warehouses.router, prefix="/api/v1", tags=["Warehouses"])
app.include_router(categories.router, prefix="/api/v1", tags=["Categories"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Inventory Management System API is running"}
