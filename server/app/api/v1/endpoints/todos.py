from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.todo import Todo, TodoCreate, TodoUpdate
from app.crud import crud_todo

router = APIRouter()

@router.get("/", response_model=List[Todo])
def read_todos():
    return crud_todo.get_todos()

@router.post("/", response_model=Todo)
def create_todo(todo: TodoCreate):
    return crud_todo.create_todo(todo=todo)

@router.put("/{todo_id}", response_model=Todo)
def update_todo(todo_id: str, todo: TodoUpdate):
    db_todo = crud_todo.get_todo(todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud_todo.update_todo(todo_id=todo_id, todo=todo)
