import React from "react";
import { Trash2 } from "lucide-react";

export default function TaskTable({
  todos,
  onToggleComplete,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div className="bg-surface rounded-lg border border-outline-variant card-elevation overflow-hidden">
      <div className="p-md border-b border-outline-variant bg-surface-container-highest/30 flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">
          Your To-Do List
        </h3>
        <div className="flex gap-sm">
          <span className="px-sm py-xs rounded-full bg-primary/10 text-primary font-label-sm text-label-sm border border-primary/20">
            All Tasks
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/10 border-b border-outline-variant text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <th className="p-sm pl-md w-12 text-center">Status</th>
              <th className="p-sm">Task Details</th>
              <th className="p-sm w-32">Created Date</th>
              <th className="p-sm pr-md w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/50">
            {todos.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-lg text-center text-on-surface-variant"
                >
                  No tasks found. Add some tasks to get started!
                </td>
              </tr>
            ) : (
              todos.map((todo) => (
                <tr
                  key={todo.id}
                  className={`hover:bg-surface-container-highest/20 transition-colors group ${
                    todo.completed ? "bg-surface-container-lowest/50" : ""
                  }`}
                >
                  <td className="p-sm pl-md text-center align-top pt-md">
                    <input
                      className={`w-4 h-4 rounded border-outline-variant bg-background text-primary focus:ring-primary focus:ring-offset-surface cursor-pointer`}
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() =>
                        onToggleComplete(todo.id, !todo.completed)
                      }
                    />
                  </td>
                  <td className="p-sm py-md">
                    <p
                      className={`font-semibold text-on-surface mb-xs ${
                        todo.completed
                          ? "line-through opacity-70 text-on-surface-variant"
                          : ""
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p
                        className={`text-on-surface-variant text-sm ${
                          todo.completed ? "line-through opacity-70" : ""
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                    {todo.completed && (
                      <span className="inline-block mt-xs px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success uppercase tracking-wider">
                        Completed
                      </span>
                    )}
                  </td>
                  <td
                    className={`p-sm align-top pt-md text-on-surface-variant text-sm ${
                      todo.completed ? "opacity-70" : ""
                    }`}
                  >
                    {todo.created_at ? todo.created_at.split("T")[0] : ""}
                  </td>
                  <td className="p-sm pr-md align-top pt-md text-right">
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-md hover:bg-error/10"
                      title="Delete Task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-md border-t border-outline-variant bg-surface-container-highest/10 flex justify-between items-center">
          <span className="text-sm text-on-surface-variant">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-sm">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-sm py-xs rounded border border-outline-variant text-sm text-on-surface hover:bg-surface-container-highest/30 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-sm py-xs rounded border border-outline-variant text-sm text-on-surface hover:bg-surface-container-highest/30 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
