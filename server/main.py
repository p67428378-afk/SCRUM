
from fastapi import FastAPI
from .database import engine, Base
from .routers import todos

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todos.router)
