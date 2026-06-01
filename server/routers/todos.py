from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, models, schemas
from ..database import get_db, engine
from typing import List
from uuid import UUID

models.Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/api/v1/todos",
    tags=["todos"],
)

@router.post("/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=todo)

@router.get("/", response_model=List[schemas.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return todos

@router.get("/{todo_id}", response_model=schemas.Todo)
def read_todo(todo_id: UUID, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: UUID, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    db_todo = crud.update_todo(db, todo_id=todo_id, todo=todo)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.delete("/{todo_id}")
def delete_todo(todo_id: UUID, db: Session = Depends(get_db)):
    db_todo = crud.delete_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo item deleted successfully"}
