import csv
import uuid
from typing import List, Optional

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate

DATA_FILE = "server/app/data/todos.csv"

def get_all() -> List[Todo]:
    todos = []
    try:
        with open(DATA_FILE, mode='r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                todos.append(Todo(id=uuid.UUID(row["id"]), description=row["description"], completed=row["completed"].lower() == 'true'))
    except FileNotFoundError:
        return todos
    return todos

def get(todo_id: uuid.UUID) -> Optional[Todo]:
    todos = get_all()
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return None

def create(todo_create: TodoCreate) -> Todo:
    todos = get_all()
    new_todo = Todo(description=todo_create.description, completed=False)
    todos.append(new_todo)
    _save_todos_to_csv(todos)
    return new_todo

def update(todo_id: uuid.UUID, todo_update: TodoUpdate) -> Optional[Todo]:
    todos = get_all()
    for todo in todos:
        if todo.id == todo_id:
            todo.completed = todo_update.completed
            _save_todos_to_csv(todos)
            return todo
    return None

def _save_todos_to_csv(todos: List[Todo]):
    with open(DATA_FILE, mode='w', newline='') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for todo in todos:
            writer.writerow({'id': str(todo.id), 'description': todo.description, 'completed': str(todo.completed)})
