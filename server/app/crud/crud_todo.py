import csv
import uuid
from typing import List, Optional
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate

DATA_FILE = "server/app/data/todos.csv"

def get_todos() -> List[Todo]:
    todos = []
    try:
        with open(DATA_FILE, mode='r', newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                todos.append(Todo(**row))
    except FileNotFoundError:
        return todos
    return todos

def create_todo(todo: TodoCreate) -> Todo:
    todos = get_todos()
    new_todo = Todo(id=str(uuid.uuid4()), description=todo.description, completed=todo.completed)
    todos.append(new_todo)
    with open(DATA_FILE, mode='w', newline='') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for t in todos:
            writer.writerow({'id': t.id, 'description': t.description, 'completed': t.completed})
    return new_todo

def get_todo(todo_id: str) -> Optional[Todo]:
    todos = get_todos()
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return None

def update_todo(todo_id: str, todo: TodoUpdate) -> Optional[Todo]:
    todos = get_todos()
    updated_todo = None
    for i, t in enumerate(todos):
        if t.id == todo_id:
            todos[i].completed = todo.completed
            updated_todo = todos[i]
            break
    if updated_todo:
        with open(DATA_FILE, mode='w', newline='') as csvfile:
            fieldnames = ['id', 'description', 'completed']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for t in todos:
                writer.writerow({'id': t.id, 'description': t.description, 'completed': t.completed})
    return updated_todo
