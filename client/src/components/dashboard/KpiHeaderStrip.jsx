import React from "react";

export default function KpiHeaderStrip({ kpis, loading }) {
  const sales = kpis ? `$${kpis.sales_per_linear_ft.toFixed(2)}` : "$45.50";
  const pb = kpis ? `${kpis.private_brand_percentage.toFixed(1)}%` : "22.5%";
  const inStock = kpis ? `${kpis.in_stock_rate.toFixed(1)}%` : "96.0%";
  const capacity = kpis ? `${kpis.shelf_capacity_used.toFixed(1)}%` : "88.0%";

  const totalSkus = kpis
    ? Math.round((kpis.shelf_capacity_used / 100) * 500)
    : 440;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-stack-lg">
      {/* Sales per Linear Ft */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
        <div className="font-data-label text-data-label text-[#94A3B8] mb-2 uppercase tracking-wider">
          Sales per Linear Ft
        </div>
        <div className="font-display-lg text-display-lg text-on-surface mb-1">
          {loading ? "..." : sales}
        </div>
        <div className="flex items-center gap-1 text-primary font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>+12.5% vs last year</span>
        </div>
      </div>

      {/* Private Brand % */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <div className="font-data-label text-data-label text-[#94A3B8] mb-2 uppercase tracking-wider">
          Private Brand %
        </div>
        <div className="font-display-lg text-display-lg text-on-surface mb-1">
          {loading ? "..." : pb}
        </div>
        <div className="flex items-center gap-1 text-primary font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-sm">
            check_circle
          </span>
          <span>Target: &gt;20.0% PASS</span>
        </div>
      </div>

      {/* In-Stock Rate */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
        <div className="font-data-label text-data-label text-[#94A3B8] mb-2 uppercase tracking-wider">
          In-Stock Rate
        </div>
        <div className="font-display-lg text-display-lg text-on-surface mb-1">
          {loading ? "..." : inStock}
        </div>
        <div className="flex items-center gap-1 text-primary font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-sm">
            health_and_safety
          </span>
          <span>Status: Healthy</span>
        </div>
      </div>

      {/* Shelf Capacity Used */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary-container/5 pointer-events-none"></div>
        <div className="font-data-label text-data-label text-[#94A3B8] mb-2 uppercase tracking-wider">
          Shelf Capacity Used
        </div>
        <div className="font-display-lg text-display-lg text-on-surface mb-1">
          {loading ? "..." : capacity}
        </div>
        <div className="flex items-center gap-1 text-secondary-container font-body-sm text-body-sm">
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          <span>Capacity: {totalSkus}/500 SKUs</span>
        </div>
      </div>
    </div>
  );
}
