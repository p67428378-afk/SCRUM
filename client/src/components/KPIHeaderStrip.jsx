import React from "react";
import {
  DollarSign,
  Tag,
  CheckCircle,
  Layers,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function KPIHeaderStrip({ kpis, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-36 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <span className="font-semibold">Unable to load KPI metrics: </span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const salesPerLinearFt = kpis?.sales_per_linear_ft ?? 0;
  const privateBrandPct = kpis?.private_brand_pct ?? 0;
  const inStockRate = kpis?.in_stock_rate ?? 0;
  const shelfCapacityPct = kpis?.shelf_capacity_pct ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Sales per Linear Ft */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sales / Linear Ft
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            $
            {salesPerLinearFt.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% vs. Cluster Baseline</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
      </div>

      {/* 2. Private Brand % */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Private Brand %
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {privateBrandPct.toFixed(1)}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Target: 25.0% - 35.0%</span>
            <span className="text-emerald-600 font-semibold">(On Target)</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ECC000]"></div>
      </div>

      {/* 3. In-Stock Rate */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            In-Stock Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {inStockRate.toFixed(1)}%
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
            <span>SLA Floor: 95.0%</span>
            <span className="text-emerald-600 font-semibold">• Healthy</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
      </div>

      {/* 4. Shelf Capacity */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Shelf Capacity
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {shelfCapacityPct.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Max Limit: 95.0%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                shelfCapacityPct > 95
                  ? "bg-red-500"
                  : shelfCapacityPct > 90
                    ? "bg-amber-500"
                    : "bg-indigo-500"
              }`}
              style={{ width: `${Math.min(shelfCapacityPct, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
      </div>
    </div>
  );
}
