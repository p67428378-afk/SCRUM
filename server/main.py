import os
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import crud, schemas

# Import models to register them with Base.metadata

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TaskFlow API",
    description="RESTful API for managing to-do items",
    version="1.0.0",
)

# CORS Middleware configuration
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


@app.post(
    "/api/v1/todos",
    response_model=schemas.TodoResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    if not todo.title or not todo.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title is empty or missing",
        )
    return crud.create_todo(db=db, todo=todo)


@app.get("/api/v1/todos", response_model=schemas.PaginatedTodoResponse)
def read_todos(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    return crud.get_todos(db=db, skip=skip, limit=limit)


@app.get("/api/v1/todos/{id}", response_model=schemas.TodoResponse)
def read_todo(id: str, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db=db, todo_id=id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="To-do item not found or soft-deleted",
        )
    return db_todo


@app.put("/api/v1/todos/{id}", response_model=schemas.TodoResponse)
def update_todo(
    id: str, todo_update: schemas.TodoUpdate, db: Session = Depends(get_db)
):
    # Check if title is provided but empty
    if todo_update.title is not None and not todo_update.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title cannot be empty",
        )
    db_todo = crud.update_todo(db=db, todo_id=id, todo_update=todo_update)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="To-do item not found"
        )
    return db_todo


@app.delete("/api/v1/todos/{id}", response_model=schemas.TodoDeleteResponse)
def delete_todo(id: str, db: Session = Depends(get_db)):
    db_todo = crud.soft_delete_todo(db=db, todo_id=id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="To-do item not found"
        )
    return db_todo
