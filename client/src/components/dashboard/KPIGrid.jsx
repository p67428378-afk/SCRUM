import React from "react";

export default function KPIGrid({
  total = 0,
  confirmed = 0,
  pending = 0,
  unavailable = 0,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* KPI 1: Total Bookings */}
      <div className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-primary/50 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">book_online</span>
          </div>
          <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded-full">
            +8%
          </span>
        </div>
        <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">
          Total Bookings
        </p>
        <h3 className="text-4xl font-bold">{total}</h3>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1 bg-primary group-hover:w-full transition-all duration-500"></div>
      </div>

      {/* KPI 2: Confirmed */}
      <div className="glass-panel p-6 rounded-xl hover:border-primary/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">
          Confirmed
        </p>
        <h3 className="text-4xl font-bold">{confirmed}</h3>
      </div>

      {/* KPI 3: Pending */}
      <div className="glass-panel p-6 rounded-xl hover:border-tertiary/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">
          Pending
        </p>
        <h3 className="text-4xl font-bold">{pending}</h3>
      </div>

      {/* KPI 4: Unavailable */}
      <div className="glass-panel p-6 rounded-xl hover:border-error/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
            <span className="material-symbols-outlined">block</span>
          </div>
        </div>
        <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">
          Unavailable Days
        </p>
        <h3 className="text-4xl font-bold">{unavailable}</h3>
      </div>
    </div>
  );
}
