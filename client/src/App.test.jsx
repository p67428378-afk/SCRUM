
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

// Mock the api module
vi.mock('./services/api');

describe('App', () => {
  it('renders the header and input', () => {
    render(<App />);
    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
  });

  it('fetches and displays todos on initial render', async () => {
    const todos = [{ id: 1, title: 'Test Todo', completed: false }];
    api.getTodos.mockResolvedValue({ data: todos });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo')).toBeInTheDocument();
    });
  });

  it('adds a new todo', async () => {
    const newTodo = { id: 2, title: 'New Todo', completed: false };
    api.getTodos.mockResolvedValue({ data: [] }); // Initial load
    api.createTodo.mockResolvedValue({ data: newTodo });

    render(<App />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add Task');

    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
  });

  it('updates a todo', async () => {
    const initialTodos = [{ id: 1, title: 'Test Todo', completed: false }];
    const updatedTodo = { id: 1, title: 'Updated Todo', completed: true };
    api.getTodos.mockResolvedValue({ data: initialTodos });
    api.updateTodo.mockResolvedValue({ data: updatedTodo });

    render(<App />);

    await waitFor(() => {
      // The checkbox is the div with the checkmark
      const checkbox = screen.getByText('Test Todo').previousSibling;
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
        expect(api.updateTodo).toHaveBeenCalledWith(1, { id: 1, title: 'Test Todo', completed: true });
    });
  });

  it('deletes a todo', async () => {
    const todos = [{ id: 1, title: 'Test Todo', completed: false }];
    api.getTodos.mockResolvedValue({ data: todos });
    api.deleteTodo.mockResolvedValue({});

    render(<App />);

    await waitFor(() => {
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Todo')).not.toBeInTheDocument();
    });
  });
});
