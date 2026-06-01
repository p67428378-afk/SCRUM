
from fastapi import FastAPI
from .database import engine
from . import models
from .routers import todos

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todos.router, prefix="/api/v1")
