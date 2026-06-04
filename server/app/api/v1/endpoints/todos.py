
from typing import List
import uuid

from fastapi import APIRouter, HTTPException

from app.crud import todo
from app.schemas.todo import Todo, TodoCreate, TodoUpdate

router = APIRouter()


@router.get("/", response_model=List[Todo])
def read_todos():
    """
    Retrieve all todo items.
    """
    return todo.get_all()


@router.post("/", response_model=Todo)
def create_todo(
    *, 
    todo_in: TodoCreate
):
    """
    Create new todo.
    """
    if not todo_in.description:
        raise HTTPException(status_code=422, detail="Description cannot be empty.")
    return todo.create(todo_in=todo_in)


@router.put("/{todo_id}", response_model=Todo)
def update_todo(
    *, 
    todo_id: uuid.UUID, 
    todo_in: TodoUpdate
):
    """
    Update a todo.
    """
    db_todo = todo.get(todo_id=todo_id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    updated_todo = todo.update(todo_id=todo_id, todo_in=todo_in)
    return updated_todo
