import React from "react";
import { Scale, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";

export default function AdminKpiMetrics({ summaryData, loading }) {
  const metrics = summaryData || {
    total_tonnage: 14.5,
    route_completion_pct: 98.2,
    sla_compliance_pct: 98.0,
    active_overflow_alerts: 2,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-500">
            Total Collected Waste
          </p>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900">
          {loading ? "..." : `${metrics.total_tonnage} Metric Tons`}
        </p>
        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
          +8.4% vs last month
        </span>
      </div>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-500">
            Route Completion Rate
          </p>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-blue-600">
          {loading ? "..." : `${metrics.route_completion_pct}%`}
        </p>
        <span className="text-xs text-blue-600 font-semibold mt-1 block">
          Target &gt;= 95%
        </span>
      </div>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-500">
            SLA Compliance Rate
          </p>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600">
          {loading ? "..." : `${metrics.sla_compliance_pct}%`}
        </p>
        <span className="text-xs text-emerald-600 font-semibold mt-1 block">
          On-time pickups
        </span>
      </div>

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-medium text-slate-500">
            Active Overflow Alerts
          </p>
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-600">
          {loading ? "..." : `${metrics.active_overflow_alerts} Pending`}
        </p>
        <span className="text-xs text-red-600 font-semibold mt-1 block">
          Zone 2 Waterfront
        </span>
      </div>
    </div>
  );
}
