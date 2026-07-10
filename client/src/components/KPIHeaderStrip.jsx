import React from "react";

export default function KPIHeaderStrip({ kpis }) {
  const {
    sales_per_linear_ft = 15.75,
    private_brand_pct = 22.0,
    in_stock_rate = 94.2,
    shelf_capacity = 85.0,
  } = kpis || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-margin">
      {/* Sales per Linear Ft */}
      <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs relative z-10">
          Sales per Linear Ft
        </span>
        <div className="flex items-baseline gap-sm relative z-10">
          <span className="font-display-sm text-display-sm text-on-surface">
            ${sales_per_linear_ft.toFixed(2)}
          </span>
          <div className="flex items-center text-[#16a34a] font-label-md text-label-md bg-[#16a34a]/10 px-xs rounded">
            <span className="material-symbols-outlined text-[14px]">
              arrow_upward
            </span>
            4.2%
          </div>
        </div>
      </div>

      {/* Private Brand % */}
      <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs relative z-10">
          Private Brand %
        </span>
        <div className="flex items-baseline gap-sm relative z-10">
          <span className="font-display-sm text-display-sm text-on-surface">
            {private_brand_pct.toFixed(1)}%
          </span>
          <span className="text-on-surface-variant font-label-sm text-label-sm">
            Target: &gt;20%
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1 mt-sm rounded-full overflow-hidden relative z-10">
          <div
            className="bg-[#16a34a] h-full rounded-full"
            style={{
              width: `${Math.min(100, (private_brand_pct / 20) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* In-Stock Rate */}
      <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex justify-between items-start mb-xs relative z-10">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase">
            In-Stock Rate
          </span>
          {in_stock_rate < 95 && (
            <span className="material-symbols-outlined text-[#ea580c] text-[18px]">
              warning
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-sm relative z-10">
          <span className="font-display-sm text-display-sm text-on-surface">
            {in_stock_rate.toFixed(1)}%
          </span>
          <span className="text-on-surface-variant font-label-sm text-label-sm">
            Target: 95%
          </span>
        </div>
        <div className="w-full bg-surface-container-highest h-1 mt-sm rounded-full overflow-hidden relative z-10">
          <div
            className="bg-[#ea580c] h-full rounded-full"
            style={{ width: `${in_stock_rate}%` }}
          ></div>
        </div>
      </div>

      {/* Shelf Capacity */}
      <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md flex flex-col relative overflow-hidden group">
        <div className="absolute inset-0 bg-surface-container-low opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-xs relative z-10">
          Shelf Capacity
        </span>
        <div className="flex items-baseline gap-sm relative z-10">
          <span className="font-display-sm text-display-sm text-on-surface">
            {shelf_capacity.toFixed(1)}%
          </span>
          <span className="text-[#16a34a] font-label-sm text-label-sm bg-[#16a34a]/10 px-xs rounded">
            Optimal
          </span>
        </div>
      </div>
    </div>
  );
}
