import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Badge } from "../common/Badge";
import { FolderKanban, ArrowRight, Trash2, Edit } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();

  return (
    <div
      data-testid="project-card"
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
              {project.name}
            </h3>
          </div>
          <Badge label={project.status} variant={project.status} />
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit project"
              aria-label="Edit project"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Delete project (Admin only)"
              aria-label="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>View Board</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    owner_id: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProjectCard;
