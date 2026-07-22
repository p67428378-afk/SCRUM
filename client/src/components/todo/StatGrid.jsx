import React from "react";

export default function StatGrid({ todos = [] }) {
  const total = todos.length;
  const high = todos.filter((t) => t.priority === "High").length;
  const medium = todos.filter((t) => t.priority === "Medium").length;
  const low = todos.filter((t) => t.priority === "Low").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
      {/* Total Tasks */}
      <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between hover:shadow-[0px_8px_20px_rgba(15,23,42,0.08)] transition-shadow">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
            Total Tasks
          </p>
          <p className="font-display text-3xl font-bold text-on-background">
            {total}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
          <span className="material-symbols-outlined text-[28px]">task</span>
        </div>
      </div>

      {/* High Priority */}
      <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between hover:shadow-[0px_8px_20px_rgba(15,23,42,0.08)] transition-shadow">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
            High Priority
          </p>
          <p className="font-display text-3xl font-bold text-on-background">
            {high}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
          <span className="material-symbols-outlined text-[28px]">
            priority_high
          </span>
        </div>
      </div>

      {/* Medium Priority */}
      <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between hover:shadow-[0px_8px_20px_rgba(15,23,42,0.08)] transition-shadow">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
            Medium Priority
          </p>
          <p className="font-display text-3xl font-bold text-on-background">
            {medium}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>
      </div>

      {/* Low Priority */}
      <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between hover:shadow-[0px_8px_20px_rgba(15,23,42,0.08)] transition-shadow">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">
            Low Priority
          </p>
          <p className="font-display text-3xl font-bold text-on-background">
            {low}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-[28px]">
            low_priority
          </span>
        </div>
      </div>
    </div>
  );
}
