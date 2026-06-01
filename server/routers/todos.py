
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/api/v1/todos", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    if not todo.title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")
    return crud.create_todo(db=db, todo=todo)

@router.get("/api/v1/todos", response_model=List[str])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return [todo.title for todo in todos]

@router.get("/api/v1/todos/{id}", response_model=schemas.Todo)
def read_todo(id: uuid.UUID, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/api/v1/todos/{id}", response_model=schemas.Todo)
def update_todo(id: uuid.UUID, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    if not todo.title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")
    db_todo = crud.update_todo(db, todo_id=id, todo=todo)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.delete("/api/v1/todos/{id}")
def delete_todo(id: uuid.UUID, db: Session = Depends(get_db)):
    db_todo = crud.delete_todo(db, todo_id=id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo item deleted successfully"}
