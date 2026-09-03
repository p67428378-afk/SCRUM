import React, { useState } from "react";
import { Users, Calendar, CheckCircle2, Clock, Ban } from "lucide-react";

export default function TableFloorPlan({ tables = [], onReserveTableClick }) {
  const [filter, setFilter] = useState("All");

  const statusConfig = {
    Available: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      badge: "bg-emerald-600 text-white",
      icon: CheckCircle2,
    },
    Occupied: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      badge: "bg-amber-600 text-white",
      icon: Users,
    },
    Reserved: {
      bg: "bg-purple-50 border-purple-200 text-purple-700",
      badge: "bg-purple-600 text-white",
      icon: Clock,
    },
  };

  const filteredTables = tables.filter((t) => {
    if (filter === "All") return true;
    return t.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Interactive Floor Plan
          </h2>
          <p className="text-xs text-slate-500">
            Live cafe table occupancy, seating capacity, and active
            reservations.
          </p>
        </div>
        <button
          onClick={onReserveTableClick}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {["All", "Available", "Occupied", "Reserved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const config = statusConfig[table.status] || statusConfig.Available;
          const Icon = config.icon;

          return (
            <div
              key={table.id}
              className={`p-4 rounded-2xl border ${config.bg} flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  Table {table.table_number}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}
                >
                  {table.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Users className="w-4 h-4" />
                <span>Seats: {table.capacity} guests</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <Icon className="w-4 h-4" />
                {table.status === "Available" ? (
                  <button
                    onClick={() =>
                      onReserveTableClick && onReserveTableClick(table)
                    }
                    className="text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    Reserve Now
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">
                    In Use
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
