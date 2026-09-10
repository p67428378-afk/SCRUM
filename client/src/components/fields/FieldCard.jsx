import React from "react";
import { MapPin, Calendar, Sprout, Plus } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function FieldCard({ field, onScheduleCropCycle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
      <div>
        {/* Field Name & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {field.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {field.acreage} Acres • Soil: {field.soil_type}
            </p>
          </div>
          <StatusBadge status={field.status || "Active"} />
        </div>

        {/* GIS Coordinates */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mb-4 text-[11px] font-mono text-slate-600 flex justify-between items-center">
          <span>GIS: {field.location_gis || "41.403, -2.174"}</span>
          <span className="text-emerald-700 font-semibold font-sans">
            Soil Moisture: 68%
          </span>
        </div>

        {/* Current Crop Cycle */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
              Active Crop:
            </span>
            <span className="font-bold text-slate-800">
              {field.current_crop || "None / Fallow"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Soil Health Index:
            </span>
            <span className="font-semibold text-emerald-700">
              Optimal (pH 6.8)
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          onClick={() => onScheduleCropCycle(field)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Crop Cycle
        </button>
      </div>
    </div>
  );
}
