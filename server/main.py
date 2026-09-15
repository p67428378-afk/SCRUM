import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from server.database import init_db
from server.routers import tenants, users, configs, audit


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Tenant Management System API",
    version="1.0.0",
    description="Multi-tenant management platform API",
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

# Include API Routers
app.include_router(tenants.router)
app.include_router(users.router)
app.include_router(configs.router)
app.include_router(audit.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
