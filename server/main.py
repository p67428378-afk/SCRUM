
from fastapi import FastAPI
from server.database import engine
from server.models import Base
from server.routers import todos

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(todos.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"Hello": "World"}
