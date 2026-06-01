
import React, { useState } from 'react';

const TodoItem = ({ todo, onUpdateTodo, onDeleteTodo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const handleUpdate = () => {
    if (title.trim()) {
      onUpdateTodo(todo.id, { ...todo, title });
      setIsEditing(false);
    }
  };

  const handleToggle = () => {
    onUpdateTodo(todo.id, { ...todo, completed: !todo.completed });
  };

  return (
    <div className="group bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/20 flex items-center justify-between hover:shadow-md hover:bg-surface-container-low transition-all">
      <div className="flex items-center gap-md">
        <div
          className={`w-6 h-6 rounded-md border-2 ${todo.completed ? 'bg-[#10B981] border-[#10B981]' : 'border-outline group-hover:border-primary'} cursor-pointer transition-colors flex items-center justify-center`}
          onClick={handleToggle}
        >
          {todo.completed && <span className="material-symbols-outlined text-white text-[16px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdate}
            onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
            className="text-body-md font-body-md text-on-surface bg-transparent border-b-2 border-primary outline-none"
          />
        ) : (
          <span className={`text-body-md font-body-md ${todo.completed ? 'text-outline-variant line-through' : 'text-on-surface'}`}>
            {todo.title}
          </span>
        )}
      </div>
      <div className="flex items-center gap-sm">
        <button
          className={`p-sm text-primary hover:bg-primary-fixed rounded-lg transition-colors flex items-center gap-xs ${todo.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !todo.completed && setIsEditing(true)}
          disabled={todo.completed}
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
          <span className="text-label-sm font-label-sm hidden md:inline">Edit</span>
        </button>
        <button
          className="p-sm text-error hover:bg-error-container rounded-lg transition-colors flex items-center gap-xs"
          onClick={() => onDeleteTodo(todo.id)}
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
          <span className="text-label-sm font-label-sm hidden md:inline">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
