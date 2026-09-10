import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  status = "optimal",
  onClick,
}) {
  const statusStyles = {
    optimal: "border-l-4 border-l-emerald-600 bg-white text-slate-800",
    success: "border-l-4 border-l-emerald-600 bg-white text-slate-800",
    warning: "border-l-4 border-l-amber-500 bg-amber-50/30 text-slate-800",
    critical: "border-l-4 border-l-rose-600 bg-rose-50/30 text-slate-800",
    info: "border-l-4 border-l-sky-500 bg-white text-slate-800",
  };

  const badgeStyles = {
    optimal: "bg-emerald-100 text-emerald-800 border-emerald-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    critical: "bg-rose-100 text-rose-800 border-rose-200",
    info: "bg-sky-100 text-sky-800 border-sky-200",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg p-5 shadow-sm border border-slate-200 ${statusStyles[status] || statusStyles.optimal} transition-all duration-200 hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div
            className={`p-2 rounded-lg ${badgeStyles[status] || badgeStyles.optimal} border`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
