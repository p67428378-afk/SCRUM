import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos, onToggleTodo }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2">Tasks</h2>
      <ul className="space-y-2">
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} onToggleTodo={onToggleTodo} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
