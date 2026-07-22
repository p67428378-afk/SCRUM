import React from "react";
import Badge from "../common/Badge.jsx";

export default function TaskCard({ todo, onEdit, onDelete }) {
  const { id, title, description, due_date, priority } = todo;

  // Left border color based on priority
  const borderColors = {
    High: "bg-error",
    Medium: "bg-tertiary-fixed",
    Low: "bg-surface-container-high",
  };

  const leftBorderColor = borderColors[priority] || "bg-tertiary-fixed";

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return "No due date";
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex flex-col hover:shadow-[0px_10px_25px_rgba(15,23,42,0.1)] transition-shadow group relative overflow-hidden min-h-[180px]">
      <div
        className={`absolute top-0 left-0 w-1 h-full ${leftBorderColor}`}
      ></div>
      <div className="flex justify-between items-start mb-sm pl-xs">
        <h3 className="font-headline-md text-headline-md text-on-background group-hover:text-primary transition-colors font-semibold">
          {title}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(todo)}
            className="text-outline hover:text-primary transition-colors p-1"
            title="Edit task"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-outline hover:text-error transition-colors p-1"
            title="Delete task"
          >
            <span className="material-symbols-outlined text-[20px]">
              delete
            </span>
          </button>
        </div>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg flex-grow pl-xs whitespace-pre-wrap">
        {description || "No description provided."}
      </p>
      <div className="flex items-center justify-between mt-auto pl-xs pt-md border-t border-outline-variant/20">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">
            calendar_today
          </span>
          <span className="font-label-sm text-label-sm">
            {formatDate(due_date)}
          </span>
        </div>
        <Badge priority={priority} />
      </div>
    </div>
  );
}
