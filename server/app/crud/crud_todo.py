
from sqlalchemy.orm import Session
from server.app.models.todo import Todo
from server.app.schemas.todo import TodoCreate, TodoUpdate

def get_todo(db: Session, todo_id: int):
    return db.query(Todo).filter(Todo.id == todo_id).first()

def get_todos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Todo).offset(skip).limit(limit).all()

def create_todo(db: Session, todo: TodoCreate):
    db_todo = Todo(description=todo.description)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, db_todo: Todo, todo: TodoUpdate):
    db_todo.completed = todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo
