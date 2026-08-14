import React, { useState, useEffect } from "react";
import StatsOverview from "../components/dashboard/StatsOverview";
import TaskTable from "../components/tasks/TaskTable";
import TaskModal from "../components/tasks/TaskModal";
import {
  getDashboardStatsApi,
  getTasksApi,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from "../services/api";
import { Sparkles, Plus } from "lucide-react";

export default function DashboardPage({ searchQuery }) {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [skip, setSkip] = useState(0);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoadingStats(true);
      const statsData = await getDashboardStatsApi();
      setStats(statsData);
    } catch (e) {
      console.error("Failed to fetch dashboard stats", e);
    } finally {
      setLoadingStats(false);
    }

    try {
      setLoadingTasks(true);
      const params = {
        skip,
        limit: 5,
        search: searchQuery || undefined,
        ...filters,
      };
      const tasksData = await getTasksApi(params);
      setRecentTasks(tasksData.items || []);
      setTotalTasks(tasksData.total || 0);
    } catch (e) {
      console.error("Failed to fetch recent tasks", e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, skip, filters]);

  const handleCreateOrUpdateTask = async (taskData, taskId) => {
    if (taskId) {
      await updateTaskApi(taskId, taskData);
    } else {
      await createTaskApi(taskData);
    }
    await loadData();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTaskApi(taskId);
      await loadData();
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
    await loadData();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setSkip(0);
  };

  return (
    <div className="space-y-8">
      {/* Page Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Productivity Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor task progress, priority metrics, and upcoming deadlines.
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

      {/* Stats Cards Overview */}
      <StatsOverview stats={stats} loading={loadingStats} />

      {/* Recent Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Recent Tasks
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Quick Actions
          </span>
        </div>

        <TaskTable
          tasks={recentTasks}
          total={totalTasks}
          skip={skip}
          limit={5}
          loading={loadingTasks}
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
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={editingTask}
      />
    </div>
  );
}
