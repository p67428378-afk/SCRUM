import React from "react";

export default function KPIGrid({
  gpa = 0.0,
  enrolledCount = 0,
  completedCredits = 0,
  pendingDeadlinesCount = 0,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-container_gap mb-container_gap">
      {/* GPA Card */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-card_padding hover:border-outline transition-colors relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <p className="font-label-md text-label-md text-on-surface-variant mb-2">
          GPA
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-display-lg text-display-lg text-on-surface">
            {gpa.toFixed(2)}
          </h2>
          <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full font-label-md text-label-md flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">
              trending_up
            </span>
            +0.15
          </span>
        </div>
      </div>

      {/* Enrolled Card */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-card_padding hover:border-outline transition-colors relative group overflow-hidden">
        <p className="font-label-md text-label-md text-on-surface-variant mb-2">
          Enrolled
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-display-lg text-display-lg text-on-surface">
            {enrolledCount}
          </h2>
          <span className="text-on-surface-variant font-body-md text-body-md">
            Courses
          </span>
        </div>
      </div>

      {/* Credits Card */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-card_padding hover:border-outline transition-colors relative group overflow-hidden">
        <p className="font-label-md text-label-md text-on-surface-variant mb-2">
          Credits
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-display-lg text-display-lg text-on-surface">
            {completedCredits}
          </h2>
          <span className="text-on-surface-variant font-body-md text-body-md">
            Credits
          </span>
        </div>
      </div>

      {/* Deadlines Card */}
      <div className="bg-surface-container-high border border-outline-variant rounded-lg p-card_padding hover:border-outline transition-colors relative group overflow-hidden">
        <p className="font-label-md text-label-md text-on-surface-variant mb-2">
          Deadlines
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-display-lg text-display-lg text-on-surface">
            {pendingDeadlinesCount}
          </h2>
          <span className="bg-error/10 text-error px-2 py-0.5 rounded-full font-label-md text-label-md">
            Pending
          </span>
        </div>
      </div>
    </div>
  );
}
