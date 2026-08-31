import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { projectsApi, tasksApi, authApi } from "../services/api";
import { Badge } from "../components/common/Badge";
import { TaskCard } from "../components/tasks/TaskCard";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import {
  ArrowLeft,
  Plus,
  Edit,
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
} from "lucide-react";

const TASK_COLUMNS = [
  { id: "To Do", label: "To Do", icon: ListTodo, color: "border-t-slate-400" },
  {
    id: "In Progress",
    label: "In Progress",
    icon: Clock,
    color: "border-t-blue-500",
  },
  {
    id: "In Review",
    label: "In Review",
    icon: Clock,
    color: "border-t-purple-500",
  },
  {
    id: "Done",
    label: "Done",
    icon: CheckCircle2,
    color: "border-t-emerald-500",
  },
];

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projData, tasksData, usersData] = await Promise.all([
        projectsApi.get(id),
        tasksApi.list({ project_id: id }),
        authApi.getUsers().catch(() => []),
      ]);
      setProject(projData);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to load project details or tasks.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (formData) => {
    if (editingTask) {
      await tasksApi.update(editingTask.id, formData);
    } else {
      await tasksApi.create(formData);
    }
    await fetchData();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await tasksApi.delete(taskId);
        await fetchData();
      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to delete task.";
        alert(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    }
  };

  const handleProjectSubmit = async (formData) => {
    const updated = await projectsApi.update(project.id, formData);
    setProject(updated);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 bg-white rounded-xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Project Not Found
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          {error || "Could not find project details."}
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Project</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateTask}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Project Banner Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">
                  {project.name}
                </h1>
                <Badge label={project.status} variant={project.status} />
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                {project.description ||
                  "No description provided for this project."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
            <div>
              <span className="block font-semibold text-slate-700">
                {tasks.length}
              </span>
              <span>Total Tasks</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="block font-semibold text-emerald-600">
                {tasks.filter((t) => t.status === "Done").length}
              </span>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const ColIcon = col.icon;

          return (
            <div
              key={col.id}
              className={`bg-slate-100/70 rounded-xl p-3 border border-slate-200 border-t-4 ${col.color} flex flex-col min-h-[450px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white text-slate-700 rounded-full border border-slate-200 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Task List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      onEdit={handleOpenEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        projectId={id}
        users={users}
      />

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        initialData={project}
      />
    </div>
  );
};

export default ProjectDetailPage;
