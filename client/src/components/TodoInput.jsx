import React, { useState } from 'react';

const TodoInput = ({ onAddTodo }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      onAddTodo(description);
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <input
        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-2 focus:border-blue-500 focus:ring-0 outline-none transition-all duration-200"
        placeholder="Add a new todo..."
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-6 h-12 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add
      </button>
    </form>
  );
};

export default TodoInput;
