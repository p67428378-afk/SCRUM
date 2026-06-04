import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import EmptyState from './components/EmptyState';
import { getTodos, createTodo, updateTodo } from './services/api';

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await getTodos();
      setTodos(response.items);
    };
    fetchTodos();
  }, []);

  const handleAddTodo = async (description) => {
    if (description) {
      const newTodo = await createTodo({ description });
      setTodos([...todos, newTodo]);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    const updatedTodo = await updateTodo(id, { completed });
    setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-3xl rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-6">
            <header className="text-center">
              <h1 className="text-3xl font-bold text-gray-800">Simple Todo App</h1>
              <p className="text-gray-500 mt-1">Stay organized and focused on your goals.</p>
            </header>
            <TodoInput onAddTodo={handleAddTodo} />
            {todos.length > 0 ? (
              <TodoList todos={todos} onToggleTodo={handleToggleTodo} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
