import React from "react";

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  color = "blue",
}) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {Icon && (
        <div
          className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`}
        >
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
