import React from 'react';

const TodoItem = ({ todo, onToggleTodo }) => {
  const { id, description, completed } = todo;

  return (
    <li className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
      <input
        className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500 transition-all cursor-pointer"
        type="checkbox"
        checked={completed}
        onChange={() => onToggleTodo(id, !completed)}
      />
      <span className={`flex-grow text-gray-800 ${completed ? 'line-through text-gray-500' : ''}`}>
        {description}
      </span>
      <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button className="text-gray-500 hover:text-red-500 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
