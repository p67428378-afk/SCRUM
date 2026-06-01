
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import { getTodos, createTodo, updateTodo, deleteTodo } from './services/api';

const App = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await getTodos();
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const handleAddTask = async (title) => {
    try {
      const response = await createTodo(title);
      setTodos([...todos, response.data]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleUpdateTodo = async (id, updatedTodo) => {
    try {
      const response = await updateTodo(id, updatedTodo);
      setTodos(todos.map(todo => (todo.id === id ? response.data : todo)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-md py-xl space-y-lg">
        <TodoInput onAddTask={handleAddTask} />
        <TodoList todos={todos} onUpdateTodo={handleUpdateTodo} onDeleteTodo={handleDeleteTodo} />
      </main>
    </div>
  );
};

export default App;
