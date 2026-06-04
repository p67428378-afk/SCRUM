
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from server.app.api.v1.api import api_router
from server.app.core.config import settings
from server.app.models.todo import engine, SessionLocal, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.include_router(api_router, prefix=settings.API_V1_STR)
