
from fastapi import FastAPI
from server.database import engine, Base
from server.api.v1.endpoints import announcements, events

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ResidentLink API",
    description="API for managing society announcements and events.",
    version="1.0.0",
)

app.include_router(announcements.router, prefix="/api/v1", tags=["Announcements"])
app.include_router(events.router, prefix="/api/v1", tags=["Events"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the ResidentLink API"}
