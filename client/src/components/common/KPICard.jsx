import React from "react";

export default function KPICard({
  title,
  value,
  subtext,
  icon,
  gradientClass,
  subtextColor,
}) {
  return (
    <div className="card-surface rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} pointer-events-none`}
      ></div>
      <div className="flex justify-between items-start z-10">
        <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="mt-4 z-10">
        <div className="font-display-lg text-display-lg text-white">
          {value}
        </div>
        <div
          className={`flex items-center mt-2 font-data-tabular text-data-tabular ${subtextColor}`}
        >
          <span>{subtext}</span>
        </div>
      </div>
    </div>
  );
}
