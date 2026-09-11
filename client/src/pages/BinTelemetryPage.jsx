import React from "react";
import BinTelemetryTable from "../components/bins/BinTelemetryTable";

export default function BinTelemetryPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">
          Smart Bin Telemetry & Capacity Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time IoT sensor telemetry monitoring bin fill levels, battery
          health, and overflow capacity alerts across municipal zones.
        </p>
      </div>

      <BinTelemetryTable />
    </div>
  );
}
