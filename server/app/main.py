from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from server.app.database import engine, Base, get_db
from server.app.schemas import TaskCreate, TaskUpdate, TaskResponse
from server.app import crud

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API", version="1.0.0")

@app.get("/api/v1/tasks", response_model=List[TaskResponse])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_tasks(db, skip=skip, limit=limit)

@app.post("/api/v1/tasks", response_model=TaskResponse)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    # Manual validation for 400 error
    if not task_in.content or not task_in.content.strip() or len(task_in.content) > 255:
        raise HTTPException(status_code=400, detail="Content is empty or exceeds 255 characters")
    return crud.create_task(db, task_in)

@app.put("/api/v1/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, task_in: TaskUpdate, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Manual validation for 400 error
    if task_in.content is not None:
        if not task_in.content or not task_in.content.strip() or len(task_in.content) > 255:
            raise HTTPException(status_code=400, detail="Content is empty or exceeds 255 characters")
            
    return crud.update_task(db, db_task, task_in)

@app.delete("/api/v1/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.delete_task(db, db_task)
    return {"detail": "Task deleted successfully"}
