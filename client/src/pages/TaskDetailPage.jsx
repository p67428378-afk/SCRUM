import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { tasksApi, commentsApi, authApi, projectsApi } from "../services/api";
import { Badge } from "../components/common/Badge";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { CommentThread } from "../components/tasks/CommentThread";
import {
  ArrowLeft,
  Calendar,
  User,
  Edit,
  Trash2,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Clock,
} from "lucide-react";

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTaskAndComments = async () => {
    try {
      setLoading(true);
      setError("");
      const taskData = await tasksApi.get(id);
      setTask(taskData);

      const [projData, usersData, commentsData] = await Promise.all([
        projectsApi.get(taskData.project_id).catch(() => null),
        authApi.getUsers().catch(() => []),
        commentsApi.listForTask(id).catch(() => []),
      ]);

      setProject(projData);
      setUsers(usersData);
      setComments(commentsData);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to load task details.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskAndComments();
    }
  }, [id]);

  const handleTaskUpdate = async (formData) => {
    await tasksApi.update(task.id, formData);
    await fetchTaskAndComments();
  };

  const handleQuickStatusChange = async (newStatus) => {
    try {
      await tasksApi.update(task.id, { status: newStatus });
      setTask((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update status.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksApi.delete(task.id);
        navigate(project ? `/projects/${project.id}` : "/projects");
      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to delete task.";
        alert(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    }
  };

  const handleAddComment = async (body) => {
    const newComment = await commentsApi.createForTask(task.id, { body });
    // Refresh comments list
    const updated = await commentsApi.listForTask(task.id);
    setComments(updated);
    return newComment;
  };

  const handleEditComment = async (commentId, body) => {
    await commentsApi.update(commentId, { body });
    const updated = await commentsApi.listForTask(task.id);
    setComments(updated);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await commentsApi.delete(commentId);
      const updated = await commentsApi.listForTask(task.id);
      setComments(updated);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8 bg-white rounded-xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Task Not Found
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          {error || "Could not find task details."}
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const assignee = users.find((u) => u.id === task.assignee_id);
  const formattedDueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(undefined, {
        dateStyle: "medium",
      })
    : "No due date";
  const formattedCreatedAt = new Date(task.created_at).toLocaleDateString(
    undefined,
    {
      dateStyle: "medium",
    },
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={project ? `/projects/${project.id}` : "/projects"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project ? project.name : "Project Board"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Task</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Info & Comments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-slate-900 leading-snug">
                {task.summary}
              </h1>
            </div>

            <div className="prose prose-sm max-w-none text-slate-700 mb-6 whitespace-pre-wrap">
              {task.description || (
                <span className="text-slate-400 italic">
                  No description provided.
                </span>
              )}
            </div>

            {/* Quick Status Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-2">
                Change Status:
              </span>
              {["To Do", "In Progress", "In Review", "Done"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleQuickStatusChange(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    task.status === st
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Comments Thread Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <CommentThread
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              loading={commentsLoading}
            />
          </div>
        </div>

        {/* Task Metadata Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Task Details
            </h3>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Status
              </span>
              <Badge label={task.status} variant={task.status} />
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Priority
              </span>
              <Badge label={task.priority} variant={task.priority} />
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Assignee
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <User className="w-4 h-4 text-slate-400" />
                <span>{assignee ? assignee.full_name : "Unassigned"}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Due Date
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-800">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formattedDueDate}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">
                Created
              </span>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formattedCreatedAt}</span>
              </div>
            </div>

            {project && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Project
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>{project.name}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleTaskUpdate}
        initialData={task}
        projectId={task.project_id}
        users={users}
      />
    </div>
  );
};

export default TaskDetailPage;
