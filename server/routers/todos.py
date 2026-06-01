from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
from .. import crud, models, schemas
from ..database import get_db, engine

models.Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("/api/v1/todos", response_model=schemas.Todo, status_code=201)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=todo)

@router.get("/api/v1/todos", response_model=list[schemas.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return todos

@router.get("/api/v1/todos/{id}", response_model=schemas.Todo)
def read_todo(id: uuid.UUID, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/api/v1/todos/{id}", response_model=schemas.Todo)
def update_todo(id: uuid.UUID, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud.update_todo(db=db, db_todo=db_todo, todo_in=todo)

@router.delete("/api/v1/todos/{id}", status_code=204)
def delete_todo(id: uuid.UUID, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    crud.delete_todo(db, todo_id=id)
    return
