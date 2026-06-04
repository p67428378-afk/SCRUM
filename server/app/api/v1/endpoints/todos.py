
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from server.app.schemas.todo import Todo, TodoCreate, TodoUpdate
from server.app.crud import crud_todo
from server.app.models.todo import SessionLocal

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud_todo.get_todos(db, skip=skip, limit=limit)
    return todos

@router.post("/", response_model=Todo)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    return crud_todo.create_todo(db=db, todo=todo)

@router.put("/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = crud_todo.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud_todo.update_todo(db=db, db_todo=db_todo, todo=todo)
