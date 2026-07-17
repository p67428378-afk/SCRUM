import math
from sqlalchemy.orm import Session
from . import models, schemas


def get_todo(db: Session, todo_id: str):
    return (
        db.query(models.Todo)
        .filter(models.Todo.id == todo_id, models.Todo.isDeleted == False)
        .first()
    )


def get_todos(db: Session, skip: int = 0, limit: int = 10):
    query = db.query(models.Todo).filter(models.Todo.isDeleted == False)
    total_todos = query.count()

    todos = (
        query.order_by(models.Todo.created_at.desc()).offset(skip).limit(limit).all()
    )

    current_page = (skip // limit) + 1 if limit > 0 else 1
    total_pages = math.ceil(total_todos / limit) if limit > 0 else 1
    if total_pages == 0:
        total_pages = 1

    return {
        "currentPage": current_page,
        "totalPages": total_pages,
        "totalTodos": total_todos,
        "todos": todos,
    }


def create_todo(db: Session, todo: schemas.TodoCreate):
    db_todo = models.Todo(
        title=todo.title, description=todo.description, completed=False, isDeleted=False
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def update_todo(db: Session, todo_id: str, todo_update: schemas.TodoUpdate):
    db_todo = (
        db.query(models.Todo)
        .filter(models.Todo.id == todo_id, models.Todo.isDeleted == False)
        .first()
    )
    if not db_todo:
        return None

    update_data = todo_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)

    db.commit()
    db.refresh(db_todo)
    return db_todo


def soft_delete_todo(db: Session, todo_id: str):
    db_todo = (
        db.query(models.Todo)
        .filter(models.Todo.id == todo_id, models.Todo.isDeleted == False)
        .first()
    )
    if not db_todo:
        return None

    db_todo.isDeleted = True
    db.commit()
    db.refresh(db_todo)
    return db_todo
