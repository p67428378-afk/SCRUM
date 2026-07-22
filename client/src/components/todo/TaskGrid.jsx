import React from "react";
import TaskCard from "./TaskCard.jsx";

export default function TaskGrid({ todos = [], onEdit, onDelete, onComplete }) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-2xl bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm text-center p-lg">
        <span className="material-symbols-outlined text-outline text-[64px] mb-md">
          assignment_turned_in
        </span>
        <h3 className="font-headline-lg text-headline-lg text-on-background font-bold mb-xs">
          No tasks found
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Get started by adding a new task to your list.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
      {todos.map((todo) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
