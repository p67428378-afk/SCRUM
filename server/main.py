import os
import uuid
import time
import jwt
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from starlette.middleware.cors import CORSMiddleware

from server.database import init_db, seed_data, SessionLocal
from server.models.models import UserActivityLog
from server.routers import users, products, cart, orders, activity
from server.dependencies.auth import SECRET_KEY, ALGORITHM


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed initial data
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="E-Commerce Clothes & Accessories API",
    version="1.0.0",
    description="RESTful API backend for clothes and accessories shopping website (SCRUM-91)",
    lifespan=lifespan,
)

# CORS Configuration
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


@app.middleware("http")
async def log_activity_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    path = request.url.path
    if path.startswith("/api/"):
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
            except Exception:
                user_id = None

        db = SessionLocal()
        try:
            log_entry = UserActivityLog(
                id=str(uuid.uuid4()),
                user_id=user_id,
                activity_type="API_REQUEST",
                endpoint=path,
                http_method=request.method,
                status_code=response.status_code,
                client_ip=request.client.host if request.client else "127.0.0.1",
                execution_ms=round(process_time, 2),
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

    return response


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}


# Include Routers
app.include_router(users.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(activity.router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
