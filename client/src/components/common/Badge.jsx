import React from "react";
import PropTypes from "prop-types";

const VARIANT_MAP = {
  // Project & Task Statuses
  Planning: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "On Hold": "bg-amber-100 text-amber-800 border-amber-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "To Do": "bg-slate-100 text-slate-800 border-slate-200",
  "In Review": "bg-purple-100 text-purple-800 border-purple-200",
  Done: "bg-emerald-100 text-emerald-800 border-emerald-200",

  // Task Priorities
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-sky-100 text-sky-800 border-sky-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Urgent: "bg-rose-100 text-rose-800 border-rose-200 font-semibold",

  // Roles
  Admin: "bg-purple-100 text-purple-800 border-purple-300 font-medium",
  Member: "bg-slate-100 text-slate-700 border-slate-300",
};

export const Badge = ({ label, variant, className = "" }) => {
  const key = variant || label;
  const colorClass =
    VARIANT_MAP[key] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      data-testid="badge"
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
};

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
};

export default Badge;
