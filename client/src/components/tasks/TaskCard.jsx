import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Badge } from "../common/Badge";
import {
  Calendar,
  User,
  MessageSquare,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";

export const TaskCard = ({ task, users = [], onEdit, onDelete }) => {
  const assignee = users.find((u) => u.id === task.assignee_id);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      data-testid="task-card"
      className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge label={task.priority} variant={task.priority} />
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-50 transition-colors"
                title="Edit task"
                aria-label="Edit task"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors"
                title="Delete task"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1.5">
          {task.summary}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {assignee ? (
            <div
              className="flex items-center gap-1"
              title={`Assigned to ${assignee.full_name}`}
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[80px]">
                {assignee.full_name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-400">
              <User className="w-3.5 h-3.5" />
              <span>Unassigned</span>
            </div>
          )}

          {formattedDueDate && (
            <div
              className="flex items-center gap-1"
              title={`Due ${formattedDueDate}`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDueDate}</span>
            </div>
          )}
        </div>

        <Link
          to={`/tasks/${task.id}`}
          className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 transition-colors ml-2"
          title="Open task details and comments"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    project_id: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    assignee_id: PropTypes.string,
    due_date: PropTypes.string,
  }).isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default TaskCard;
