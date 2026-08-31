import React, { useState, useEffect } from "react";
import { projectsApi } from "../services/api";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import {
  Plus,
  FolderKanban,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const STATUS_FILTERS = [
  "All",
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
];

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (activeFilter !== "All") {
        params.status = activeFilter;
      }
      const data = await projectsApi.list(params);
      setProjects(data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to load projects. Please ensure the backend is running.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeFilter]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (editingProject) {
      await projectsApi.update(editingProject.id, formData);
    } else {
      await projectsApi.create(formData);
    }
    await fetchProjects();
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsApi.delete(projectId);
        await fetchProjects();
      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to delete project.";
        alert(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    }
  };

  // Status counters for all projects
  const statusCounts = {
    Total: projects.length,
    Planning: projects.filter((p) => p.status === "Planning").length,
    "In Progress": projects.filter((p) => p.status === "In Progress").length,
    "On Hold": projects.filter((p) => p.status === "On Hold").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Projects Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage projects, track delivery milestones, and coordinate
            workflows.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchProjects}
            className="flex items-center gap-1 text-xs font-semibold text-rose-800 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 h-44 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No projects found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {activeFilter === "All"
              ? "Get started by creating your first team project."
              : `No projects currently in ${activeFilter} status.`}
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;
