from datetime import datetime
from sqlalchemy.orm import Session
from server.app.models import Task
from server.app.schemas import TaskCreate, TaskUpdate

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Task).offset(skip).limit(limit).all()

def get_task(db: Session, task_id: str):
    return db.query(Task).filter(Task.id == task_id).first()

def create_task(db: Session, task_in: TaskCreate):
    db_task = Task(content=task_in.content)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, db_task: Task, task_in: TaskUpdate):
    if task_in.content is not None:
        db_task.content = task_in.content
    if task_in.is_completed is not None:
        db_task.is_completed = task_in.is_completed
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, db_task: Task):
    db.delete(db_task)
    db.commit()
    return db_task
