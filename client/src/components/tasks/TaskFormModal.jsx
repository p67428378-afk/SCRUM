import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal } from "../common/Modal";

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];
const STATUS_OPTIONS = ["To Do", "In Progress", "In Review", "Done"];

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projectId,
  users = [],
}) => {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setSummary(initialData.summary || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setAssigneeId(initialData.assignee_id || "");
      if (initialData.due_date) {
        // Convert to YYYY-MM-DD format for date input
        const d = new Date(initialData.due_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setDueDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDate("");
      }
    } else {
      setSummary("");
      setDescription("");
      setPriority("Medium");
      setStatus("To Do");
      setAssigneeId("");
      setDueDate("");
    }
    setError("");
    setLoading(false);
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Task summary is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        summary: summary.trim(),
        description: description.trim() || null,
        priority,
        status,
        assignee_id: assigneeId ? assigneeId : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (!initialData) {
        payload.project_id = projectId;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : null) ||
        "Failed to save task. Please try again.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Task" : "Create New Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="task-summary"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Task Summary <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-summary"
            type="text"
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Implement user login API"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="task-description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed task description and requirements..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-priority"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="task-status"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="task-assignee"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Assignee
            </label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : initialData
                ? "Update Task"
                : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

TaskFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    id: PropTypes.string,
    summary: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
    assignee_id: PropTypes.string,
    due_date: PropTypes.string,
  }),
  projectId: PropTypes.string,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      full_name: PropTypes.string.isRequired,
      role: PropTypes.string,
    }),
  ),
};

export default TaskFormModal;
