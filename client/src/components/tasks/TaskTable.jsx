import React from "react";
import {
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

export default function TaskTable({
  tasks = [],
  total = 0,
  skip = 0,
  limit = 20,
  loading = false,
  filters = {},
  onFilterChange,
  onEditTask,
  onDeleteTask,
  onStatusToggle,
  onPageChange,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "In Progress":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "Pending":
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "High":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Low":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {/* Table Filters Bar */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange && onFilterChange("status", e.target.value)
            }
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ""}
            onChange={(e) =>
              onFilterChange && onFilterChange("priority", e.target.value)
            }
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Sort Field */}
          <select
            value={filters.sort_by || "created_at"}
            onChange={(e) =>
              onFilterChange && onFilterChange("sort_by", e.target.value)
            }
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="created_at">Created Date</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="title">Title</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.order || "desc"}
            onChange={(e) =>
              onFilterChange && onFilterChange("order", e.target.value)
            }
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {tasks.length} of {total} tasks
        </div>
      </div>

      {/* Task List / Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 text-slate-500 opacity-60" />
            <p className="text-base font-semibold text-slate-300">
              No tasks found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Create a new task or adjust filters to view items.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 border-b border-slate-700 text-xs uppercase text-slate-400 font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Tags</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-700/30 transition-colors group"
                >
                  {/* Status Toggle Button */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onStatusToggle && onStatusToggle(task)}
                      title={`Current: ${task.status}. Click to advance.`}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${
                          task.status === "Completed"
                            ? "text-emerald-400 fill-emerald-500/20"
                            : ""
                        }`}
                      />
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span
                        className={
                          task.status === "Completed"
                            ? "line-through text-slate-400"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${getStatusBadge(task.status)} font-medium`}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-md">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getPriorityBadge(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(task.due_date)}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {task.tags && task.tags.length > 0 ? (
                        task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 text-[11px]"
                          >
                            <TagIcon className="w-2.5 h-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-xs italic">—</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditTask && onEditTask(task)}
                        title="Edit Task"
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask && onDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onPageChange && onPageChange(Math.max(0, skip - limit))
            }
            disabled={skip === 0}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange && onPageChange(skip + limit)}
            disabled={skip + limit >= total}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
