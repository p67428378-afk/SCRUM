from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.schemas import TodoCreate, TodoUpdate, TodoResponse
import server.crud as crud

router = APIRouter(prefix="/api/v1/todos", tags=["todos"])


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_todo(db=db, todo=todo)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[TodoResponse])
def read_todos(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return crud.get_todos(db=db, skip=skip, limit=limit)


@router.put("/{id}", response_model=TodoResponse)
def update_todo(id: str, todo: TodoUpdate, db: Session = Depends(get_db)):
    try:
        db_todo = crud.update_todo(db=db, todo_id=id, todo=todo)
        if db_todo is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="To-do item not found"
            )
        return db_todo
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(id: str, db: Session = Depends(get_db)):
    db_todo = crud.delete_todo(db=db, todo_id=id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="To-do item not found"
        )
    return None
