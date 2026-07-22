import React from "react";
import Badge from "../common/Badge.jsx";

export default function TaskCard({ todo, onEdit, onDelete, onComplete }) {
  const { id, title, description, due_date, priority, completed } = todo;

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
    <div
      className={`bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex flex-col hover:shadow-[0px_10px_25px_rgba(15,23,42,0.1)] transition-shadow group relative overflow-hidden min-h-[180px] ${completed ? "opacity-70 hover:opacity-100" : ""}`}
    >
      <div
        className={`absolute top-0 left-0 w-1 h-full ${completed ? "bg-brand-green" : leftBorderColor}`}
      ></div>
      <div className="flex justify-between items-start mb-sm pl-xs">
        <div className="flex gap-2">
          {completed && (
            <span className="bg-brand-green/10 text-brand-green text-[11px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Completed
            </span>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!completed && (
            <button
              onClick={() => onEdit(todo)}
              className="text-outline hover:text-primary transition-colors p-1"
              title="Edit task"
            >
              <span className="material-symbols-outlined text-[20px]">
                edit
              </span>
            </button>
          )}
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

      <div className="flex items-start gap-3 mb-lg flex-grow pl-xs">
        {completed ? (
          <button
            disabled
            className="mt-1 w-5 h-5 rounded border-transparent bg-brand-green text-white flex items-center justify-center flex-shrink-0 transition-colors"
            title="Completed"
          >
            <span className="material-symbols-outlined text-[14px] font-bold">
              check
            </span>
          </button>
        ) : (
          <button
            onClick={() => onComplete(todo)}
            className="mt-1 w-5 h-5 rounded border border-slate-300 hover:border-brand-indigo flex-shrink-0 transition-colors bg-white"
            title="Mark as complete"
          ></button>
        )}
        <div>
          <h3
            className={`font-headline-md text-headline-md font-semibold transition-colors ${completed ? "text-slate-400 line-through" : "text-on-background group-hover:text-primary"}`}
          >
            {title}
          </h3>
          <p
            className={`font-body-md text-body-md mt-1 whitespace-pre-wrap ${completed ? "text-slate-400" : "text-on-surface-variant"}`}
          >
            {description || "No description provided."}
          </p>
        </div>
      </div>

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
