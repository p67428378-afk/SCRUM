import React from "react";
import { ArrowUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function KPIHeaderStrip({ kpis }) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
      {/* KPI 1: Sales per Linear Ft */}
      <div className="bg-surface-container rounded-lg p-md border border-surface-bright flex flex-col">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">
          Sales per Linear Ft
        </span>
        <div className="flex items-end justify-between mt-auto">
          <span className="font-data-mono text-data-mono text-on-surface text-xl">
            ${kpis.sales_per_linear_ft?.toFixed(2)}
          </span>
          <div className="flex items-center text-emerald-400 gap-xs">
            <ArrowUp className="w-4 h-4" />
            <span className="font-data-mono text-xs">
              +{kpis.sales_trend_pct}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Private Brand % */}
      <div className="bg-surface-container rounded-lg p-md border border-surface-bright flex flex-col">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">
          Private Brand %
        </span>
        <div className="flex items-end justify-between mt-auto">
          <span className="font-data-mono text-data-mono text-on-surface text-xl">
            {kpis.private_brand_pct}%
          </span>
          <div className="flex items-center text-primary gap-xs bg-primary/10 px-2 py-1 rounded">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-data-mono text-xs">
              {kpis.private_brand_status}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: In-Stock Rate */}
      <div className="bg-surface-container rounded-lg p-md border border-surface-bright flex flex-col">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">
          In-Stock Rate
        </span>
        <div className="flex items-end justify-between mt-auto">
          <span className="font-data-mono text-data-mono text-on-surface text-xl">
            {kpis.in_stock_rate}%
          </span>
          <div className="flex items-center text-emerald-400 gap-xs">
            <CheckCircle className="w-4 h-4" />
            <span className="font-data-mono text-xs">
              {kpis.in_stock_status}
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: Shelf Capacity */}
      <div className="bg-surface-container rounded-lg p-md border border-surface-bright flex flex-col">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-sm">
          Shelf Capacity
        </span>
        <div className="mt-auto w-full">
          <div className="flex justify-between mb-xs">
            <span className="font-data-mono text-data-mono text-on-surface">
              {kpis.shelf_capacity}%
            </span>
          </div>
          <div className="w-full bg-surface-bright h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-400 h-full"
              style={{ width: `${kpis.shelf_capacity}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
