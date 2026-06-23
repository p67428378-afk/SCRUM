from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from server.database import engine, Base
from server.api.v1.items import router as items_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up on shutdown if needed


app = FastAPI(
    title="Aura Jewelry Inventory API",
    description="API for managing jewelry store inventory",
    version="1.0.0",
    lifespan=lifespan,
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
app.include_router(items_router)


@app.get("/")
def root():
    return {"message": "Welcome to Aura Jewelry Inventory API"}
