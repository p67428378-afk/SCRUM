import React from "react";
import { Wrench, Gauge, Clock, AlertTriangle, Plus } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function EquipmentCard({ equipment, onLogMaintenance }) {
  const isMaintenanceDue =
    (equipment.operating_hours || 0) >= 1200 ||
    equipment.status === "Maintenance Due";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Title and Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-700" />
              {equipment.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {equipment.serial_number}
            </p>
          </div>
          <StatusBadge status={equipment.status} />
        </div>

        {/* Operating Hours Gauge Meter */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              Operating Hours:
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {equipment.operating_hours} hrs
            </span>
          </div>

          {/* Progress bar towards service threshold (e.g., 1200 hrs) */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full ${
                isMaintenanceDue ? "bg-amber-500" : "bg-emerald-600"
              }`}
              style={{
                width: `${Math.min(100, ((equipment.operating_hours || 0) / 1200) * 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>0h</span>
            <span>Service Threshold: 1200h</span>
          </div>
        </div>

        {/* Maintenance Alert Notice */}
        {isMaintenanceDue && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Operating hour threshold exceeded. Maintenance required.
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Last Service:
          </span>
          <span className="font-semibold text-slate-700">
            {equipment.last_service_date || "N/A"}
          </span>
        </div>
      </div>

      {/* Log Maintenance Button */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          onClick={() => onLogMaintenance(equipment)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Maintenance / Service
        </button>
      </div>
    </div>
  );
}
