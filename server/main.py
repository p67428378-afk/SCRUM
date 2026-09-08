from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from server.config import settings
from server.database import init_db, SessionLocal, seed_data
from server.routers import (
    auth,
    residents,
    facilities,
    bookings,
    announcements,
    service_requests,
)

app = FastAPI(
    title="Village Management System API",
    description="Backend service for managing village residents, facility bookings, announcements, and service requests.",
    version="1.0.0",
)

# CORS Setup
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Village Management System API"}


# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(residents.router, prefix="/api/v1/residents", tags=["Residents"])
app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["Facilities"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(
    announcements.router, prefix="/api/v1/announcements", tags=["Announcements"]
)
app.include_router(
    service_requests.router,
    prefix="/api/v1/service-requests",
    tags=["Service Requests"],
)
