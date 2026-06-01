
import React, { useState } from 'react';

const TodoInput = ({ onAddTask }) => {
  const [title, setTitle] = useState('');

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask(title);
      setTitle('');
    }
  };

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-md p-md border border-outline-variant/30">
      <div className="flex flex-col md:flex-row gap-sm">
        <div className="relative flex-grow group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">add_task</span>
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-body-md font-body-md"
            id="todo-input"
            placeholder="Add a new todo..."
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          />
        </div>
        <button
          className="bg-[#3B82F6] hover:bg-primary-container text-white px-lg py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-sm transition-all active:scale-95 shadow-sm hover:shadow-md"
          onClick={handleAddTask}
        >
          <span>Add Task</span>
        </button>
      </div>
    </section>
  );
};

export default TodoInput;
