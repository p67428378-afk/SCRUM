import React from "react";

export default function KPIHeaderStrip({ kpis, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-low border border-outline-variant rounded-xl p-5 h-32"
          ></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error text-error p-4 rounded-xl text-center">
        Failed to load KPI metrics. Please try again later.
      </div>
    );
  }

  const data = kpis || {
    sales_per_linear_ft: 125.5,
    private_brand_percentage: 15.2,
    in_stock_rate: 98.5,
    shelf_capacity: 85.0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-card-gap">
      {/* KPI 1: Sales per Linear Ft */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 hover:border-primary/50 transition-colors relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">
            point_of_sale
          </span>
          Sales per Linear Ft
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <span className="font-display-lg text-display-lg text-on-surface">
            ${data.sales_per_linear_ft?.toFixed(2)}
          </span>
          <span className="bg-emerald-500/15 text-emerald-400 font-data-mono text-data-mono px-2 py-0.5 rounded flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-[14px]">
              arrow_upward
            </span>{" "}
            4.2%
          </span>
        </div>
      </div>

      {/* KPI 2: Private Brand % */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 hover:border-primary/50 transition-colors relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">
            storefront
          </span>
          Private Brand %
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <span className="font-display-lg text-display-lg text-on-surface">
            {data.private_brand_percentage?.toFixed(1)}%
          </span>
          <span className="text-on-surface-variant font-data-mono text-data-mono mb-1">
            Target: 18.0%
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-secondary h-full rounded-full"
            style={{
              width: `${Math.min(100, (data.private_brand_percentage / 18.0) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* KPI 3: In-Stock Rate */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 hover:border-primary/50 transition-colors relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">
            inventory
          </span>
          In-Stock Rate
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <span className="font-display-lg text-display-lg text-on-surface">
            {data.in_stock_rate?.toFixed(1)}%
          </span>
          <span className="bg-emerald-500/15 text-emerald-400 font-data-mono text-data-mono px-2 py-0.5 rounded flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-[14px]">check</span>{" "}
            Target: 98.0%
          </span>
        </div>
      </div>

      {/* KPI 4: Shelf Capacity */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 hover:border-primary/50 transition-colors relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">shelves</span>
          Shelf Capacity
        </h3>
        <div className="flex flex-wrap items-end gap-2">
          <span className="font-display-lg text-display-lg text-on-surface">
            {data.shelf_capacity?.toFixed(1)}%
          </span>
          <span className="text-on-surface-variant font-data-mono text-data-mono mb-1">
            Optimal: 80-90%
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${data.shelf_capacity}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
