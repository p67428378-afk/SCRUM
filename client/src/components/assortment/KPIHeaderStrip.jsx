import React from "react";

export default function KPIHeaderStrip({ kpis }) {
  const salesPerLinearFt =
    kpis?.sales_per_linear_ft !== undefined ? kpis.sales_per_linear_ft : 15.75;
  const privateBrandPct =
    kpis?.private_brand_pct !== undefined ? kpis.private_brand_pct : 22.4;
  const inStockRate =
    kpis?.in_stock_rate !== undefined ? kpis.in_stock_rate : 98.2;
  const shelfCapacity =
    kpis?.shelf_capacity !== undefined ? kpis.shelf_capacity : 88;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
      {/* KPI 1 */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-label-caps font-label-caps text-secondary uppercase">
            Sales per Linear Ft
          </h3>
          <span className="material-symbols-outlined text-secondary/50 text-[20px]">
            point_of_sale
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-headline-lg font-headline-lg text-on-surface data-mono font-data-mono tracking-tight">
            ${salesPerLinearFt.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-status-grow-text text-body-sm mt-1 bg-status-grow-bg/50 w-fit px-2 py-0.5 rounded">
          <span className="material-symbols-outlined text-[16px]">
            trending_up
          </span>
          <span className="font-medium">+4.2% trend</span>
        </div>
      </div>

      {/* KPI 2 */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-label-caps font-label-caps text-secondary uppercase">
            Private Brand %
          </h3>
          <span className="material-symbols-outlined text-secondary/50 text-[20px]">
            local_mall
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-headline-lg font-headline-lg text-on-surface data-mono font-data-mono tracking-tight">
            {privateBrandPct.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-1 text-secondary text-body-sm mt-1">
          <span className="material-symbols-outlined text-[16px]">flag</span>
          <span>Target: 25%</span>
        </div>
      </div>

      {/* KPI 3 */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-label-caps font-label-caps text-secondary uppercase">
            In-Stock Rate
          </h3>
          <span className="material-symbols-outlined text-secondary/50 text-[20px]">
            inventory_2
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-headline-lg font-headline-lg text-on-surface data-mono font-data-mono tracking-tight">
            {inStockRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-1 text-status-maintain-text text-body-sm mt-1 bg-status-maintain-bg/50 w-fit px-2 py-0.5 rounded">
          <span className="material-symbols-outlined text-[16px]">
            check_circle
          </span>
          <span className="font-medium">Optimal</span>
        </div>
      </div>

      {/* KPI 4 */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-5 shadow-[0_2px_4px_rgba(0,0,0,0.04)] flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-label-caps font-label-caps text-secondary uppercase">
            Shelf Capacity
          </h3>
          <span className="material-symbols-outlined text-secondary/50 text-[20px]">
            shelves
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-headline-lg font-headline-lg text-on-surface data-mono font-data-mono tracking-tight">
            {shelfCapacity.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden flex">
          <div
            className="bg-tertiary h-1.5 rounded-full"
            style={{ width: `${shelfCapacity}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center text-body-sm mt-1">
          <span className="text-secondary">
            {(100 - shelfCapacity).toFixed(0)}% remaining
          </span>
        </div>
      </div>
    </div>
  );
}
