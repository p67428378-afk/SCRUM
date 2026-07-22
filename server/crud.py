from sqlalchemy.orm import Session
from server.models import Todo
from server.schemas import TodoCreate, TodoUpdate


def get_todos(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Todo).offset(skip).limit(limit).all()


def get_todo_by_id(db: Session, todo_id: str):
    return db.query(Todo).filter(Todo.id == todo_id).first()


def create_todo(db: Session, todo: TodoCreate):
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        due_date=todo.due_date,
        priority=todo.priority,
        completed=False,
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def update_todo(db: Session, todo_id: str, todo: TodoUpdate):
    db_todo = get_todo_by_id(db, todo_id)
    if not db_todo:
        return None
    db_todo.title = todo.title
    db_todo.description = todo.description
    db_todo.due_date = todo.due_date
    db_todo.priority = todo.priority
    if todo.completed is not None:
        db_todo.completed = todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


def complete_todo(db: Session, todo_id: str):
    db_todo = get_todo_by_id(db, todo_id)
    if not db_todo:
        return None
    db_todo.completed = True
    db.commit()
    db.refresh(db_todo)
    return db_todo


def delete_todo(db: Session, todo_id: str):
    db_todo = get_todo_by_id(db, todo_id)
    if not db_todo:
        return None
    db.delete(db_todo)
    db.commit()
    return db_todo
