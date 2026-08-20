import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}) {
  return (
    <div className="bg-white border border-[#e3e8f0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#2663eb]">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-[#171c29] tracking-tight">
          {value}
        </h3>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-[#707a8c]">{subtitle}</p>}
    </div>
  );
}
