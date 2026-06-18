from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.database import engine, Base
from server.app.routers import auth, bookings, availability, notifications

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrekGuide API",
    description="API for Trekking Guide Bookings & Availability management",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(bookings.router)
app.include_router(availability.router)
app.include_router(notifications.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to TrekGuide API"}
