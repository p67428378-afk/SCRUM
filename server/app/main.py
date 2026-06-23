from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.database import engine, Base
from server.app.routers import auth, profile, academics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Apex University Student Academic Dashboard API",
    description="API for Student Dashboard authentication, profile management, and academic progress.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(academics.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Apex University Student Academic Dashboard API"}
