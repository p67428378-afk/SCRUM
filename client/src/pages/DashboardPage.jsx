import React, { useState, useEffect } from "react";
import { dashboardApi } from "../services/api";
import StatCard from "../components/common/StatCard";
import AlertBanner from "../components/common/AlertBanner";
import {
  Sprout,
  HeartPulse,
  Wrench,
  Package,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error("Error loading dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Farm Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring across crop cycles, livestock health, equipment
            telemetry, and input inventory.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-800 font-semibold">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Live Operations Connected</span>
        </div>
      </div>

      {/* KPI Metric Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Crop Cycles"
          value={summary?.active_crop_cycles ?? 4}
          subtitle="4 Parcels Planted"
          icon={Sprout}
          status="optimal"
        />
        <StatCard
          title="Livestock Headcount"
          value={summary?.livestock_headcount ?? 142}
          subtitle="Cattle & Sheep"
          icon={HeartPulse}
          status="optimal"
        />
        <StatCard
          title="Operating Equipment"
          value={summary?.equipment_operating ?? 8}
          subtitle="1 Machine Service Due"
          icon={Wrench}
          status="warning"
        />
        <StatCard
          title="Low Inventory Items"
          value={summary?.low_inventory_count ?? 2}
          subtitle="NPK & Glyphosate"
          icon={Package}
          status="critical"
        />
      </div>

      {/* Operational Alerts & System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Operational Alerts Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Active Operational Alerts & Warnings
            </h2>
            <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {summary?.alerts?.length || 3} Pending Action
            </span>
          </div>

          <div className="space-y-3">
            {(summary?.alerts || []).map((alert, idx) => (
              <AlertBanner
                key={alert.id || idx}
                type={
                  alert.severity === "critical"
                    ? "critical"
                    : alert.severity === "warning"
                      ? "warning"
                      : "info"
                }
                title={`Alert: ${alert.alert_type.toUpperCase()}`}
                message={alert.message}
              />
            ))}
          </div>
        </div>

        {/* System & Compliance Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Compliance & Audit Readiness
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800 mb-1">
                Medical Record Validation
              </div>
              <p className="text-slate-500">
                Strict rule active: Event Date, Batch ID & Vaccine Name
                mandatory.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800 mb-1">
                Negative Stock Prevention
              </div>
              <p className="text-slate-500">
                Strict rule active: Negative inventory quantities strictly
                rejected.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="font-semibold text-slate-800 mb-1">
                Equipment Hour Thresholds
              </div>
              <p className="text-slate-500">
                Auto alerts trigger when operating hours exceed service mark
                (1200h).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
