
import csv
import uuid
from typing import List, Optional

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.core.config import settings


def get_all() -> List[Todo]:
    """Retrieve all todo items from the CSV file."""
    todos = []
    try:
        with open(settings.TODOS_FILE, mode='r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                todos.append(Todo(
                    id=uuid.UUID(row['id']),
                    description=row['description'],
                    completed=row['completed'].lower() == 'true'
                ))
    except FileNotFoundError:
        # If the file doesn't exist, return an empty list and create it for the next operation.
        with open(settings.TODOS_FILE, mode='w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['id', 'description', 'completed']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
    return todos

def create(todo_in: TodoCreate) -> Todo:
    """Create a new todo item and save it to the CSV file."""
    db_todo = Todo(
        id=uuid.uuid4(),
        description=todo_in.description,
        completed=False
    )
    
    todos = get_all()
    todos.append(db_todo)
    
    with open(settings.TODOS_FILE, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for todo in todos:
            writer.writerow(todo.dict())
            
    return db_todo

def get(todo_id: uuid.UUID) -> Optional[Todo]:
    """Get a todo item by its ID."""
    todos = get_all()
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return None

def update(todo_id: uuid.UUID, todo_in: TodoUpdate) -> Optional[Todo]:
    """Update a todo item's completion status."""
    todos = get_all()
    updated_todo = None
    
    for i, todo in enumerate(todos):
        if todo.id == todo_id:
            todos[i].completed = todo_in.completed
            updated_todo = todos[i]
            break

    if not updated_todo:
        return None

    with open(settings.TODOS_FILE, mode='w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'description', 'completed']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for todo in todos:
            writer.writerow(todo.dict())
            
    return updated_todo
