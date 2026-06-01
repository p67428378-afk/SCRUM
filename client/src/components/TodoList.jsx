
import React from 'react';
import TodoItem from './TodoItem';
import EmptyStateMessage from './EmptyStateMessage';

const TodoList = ({ todos, onUpdateTodo, onDeleteTodo }) => {
  if (todos.length === 0) {
    return <EmptyStateMessage />;
  }

  return (
    <section className="space-y-sm" id="task-list">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onUpdateTodo={onUpdateTodo} onDeleteTodo={onDeleteTodo} />
      ))}
    </section>
  );
};

export default TodoList;
