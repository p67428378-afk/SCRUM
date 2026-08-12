import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, WebSocket
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import init_db, seed_data, get_db
from server.api.v1.auth import router as auth_router
from server.api.v1.tasks import router as tasks_router, websocket_task_status


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()
    yield


app = FastAPI(
    title="TaskTracker AI",
    description="Real-Time Long-Running Action Status Tracking API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware setup
ALLOWED_ORIGINS_ENV = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
ALLOWED_ORIGINS = [
    origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(tasks_router)


# Register WebSocket endpoint directly on app
@app.websocket("/api/v1/ws/tasks/{task_id}")
async def ws_app_direct(
    websocket: WebSocket, task_id: str, db: Session = Depends(get_db)
):
    await websocket_task_status(websocket, task_id, db)


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TaskTracker AI API"}
