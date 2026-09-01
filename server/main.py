import json
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import settings
from server.database import init_db
from server.api import patients, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    try:
        openapi_data = app.openapi()
        with open("server/openapi.json", "w") as f:
            json.dump(openapi_data, f, indent=2)
        with open("openapi.json", "w") as f:
            json.dump(openapi_data, f, indent=2)
    except Exception:
        pass
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
)

# Setup CORS middleware
allowed_origins = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get("/")
def root():
    return {"message": "Welcome to Patients Management System API", "docs": "/docs"}
