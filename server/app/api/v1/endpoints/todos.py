from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from app.schemas.todo import Todo, TodoCreate, TodoUpdate
from app.crud import crud_todo

router = APIRouter()

@router.get("/", response_model=List[Todo])
def read_todos():
    return crud_todo.get_all()

@router.post("/", response_model=Todo)
def create_todo(todo: TodoCreate):
    return crud_todo.create(todo)

@router.put("/{todo_id}", response_model=Todo)
def update_todo(todo_id: uuid.UUID, todo: TodoUpdate):
    db_todo = crud_todo.get(todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud_todo.update(todo_id, todo)
