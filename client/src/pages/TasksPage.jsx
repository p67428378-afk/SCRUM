import React, { useState, useEffect } from "react";
import TaskTable from "../components/tasks/TaskTable";
import TaskModal from "../components/tasks/TaskModal";
import {
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../services/api";
import { CheckSquare, Plus } from "lucide-react";

export default function TasksPage({ searchQuery }) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        skip,
        limit,
        search: searchQuery || undefined,
        ...filters,
      };
      const data = await getTasksApi(params);
      setTasks(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [skip, filters, searchQuery]);

  const handleCreateOrUpdateTask = async (taskData, taskId) => {
    if (taskId) {
      await updateTaskApi(taskId, taskData);
    } else {
      await createTaskApi(taskData);
    }
    await fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTaskApi(taskId);
      await fetchTasks();
    }
  };

  const handleStatusToggle = async (task) => {
    const nextStatus =
      task.status === "Pending"
        ? "In Progress"
        : task.status === "In Progress"
          ? "Completed"
          : "Pending";
    await updateTaskApi(task.id, { status: nextStatus });
    await fetchTasks();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setSkip(0);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" /> Task Management
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            All Tasks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, search, filter, and manage your personal tasks.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Main Task Table */}
      <TaskTable
        tasks={tasks}
        total={total}
        skip={skip}
        limit={limit}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onEditTask={(task) => {
          setEditingTask(task);
          setIsModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
        onStatusToggle={handleStatusToggle}
        onPageChange={(newSkip) => setSkip(newSkip)}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
      />
    </div>
  );
}
