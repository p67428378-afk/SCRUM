import React from "react";

export default function KPIHeaderStrip({ kpis, loading }) {
  if (loading || !kpis) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-DEFAULT border border-surface-variant p-md flex flex-col justify-between shadow-ambient h-[104px] animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </section>
    );
  }

  const {
    sales_per_linear_ft,
    private_brand_pct,
    in_stock_rate,
    shelf_capacity,
  } = kpis;

  // Determine colors based on targets
  const pbColor =
    private_brand_pct >= 20.0 ? "text-[#1E8E3E]" : "text-[#F29900]";
  const pbIcon = private_brand_pct >= 20.0 ? "check_circle" : "warning";

  const inStockColor =
    in_stock_rate >= 95.0 ? "text-[#1E8E3E]" : "text-[#D93025]";
  const inStockIcon = in_stock_rate >= 95.0 ? "check_circle" : "error";

  const shelfColor =
    shelf_capacity <= 90.0 ? "text-[#1E8E3E]" : "text-[#D93025]";
  const shelfIcon = shelf_capacity <= 90.0 ? "check_circle" : "error";

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
      {/* Sales per Linear Ft */}
      <div className="bg-white rounded-DEFAULT border border-surface-variant p-md flex flex-col justify-between shadow-ambient h-[104px]">
        <div className="flex justify-between items-start w-full">
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            Sales per Linear Ft
          </span>
          <span className="material-symbols-outlined text-on-surface-variant text-sm">
            payments
          </span>
        </div>
        <div className="flex items-baseline gap-sm w-full">
          <span className="font-headline-md text-on-surface">
            ${sales_per_linear_ft?.toFixed(2)}
          </span>
          <div className="flex items-center text-[#1E8E3E] bg-[#E6F4EA] px-2 py-0.5 rounded-DEFAULT">
            <span className="material-symbols-outlined text-[12px]">
              trending_up
            </span>
            <span className="font-label-md ml-1">+4.2% vs LY</span>
          </div>
        </div>
      </div>

      {/* Private Brand % */}
      <div className="bg-white rounded-DEFAULT border border-surface-variant p-md flex flex-col justify-between shadow-ambient h-[104px]">
        <div className="flex justify-between items-start w-full">
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            Private Brand %
          </span>
          <span className={`material-symbols-outlined ${pbColor} text-sm`}>
            {pbIcon}
          </span>
        </div>
        <div className="flex justify-between items-end w-full">
          <span className={`font-headline-md ${pbColor}`}>
            {private_brand_pct?.toFixed(1)}%
          </span>
          <span className="font-body-sm text-on-surface-variant">
            Target: &gt;= 20.0%
          </span>
        </div>
      </div>

      {/* In-Stock Rate */}
      <div className="bg-white rounded-DEFAULT border border-surface-variant p-md flex flex-col justify-between shadow-ambient h-[104px]">
        <div className="flex justify-between items-start w-full">
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            In-Stock Rate
          </span>
          <span className={`material-symbols-outlined ${inStockColor} text-sm`}>
            {inStockIcon}
          </span>
        </div>
        <div className="flex justify-between items-end w-full">
          <span className={`font-headline-md ${inStockColor}`}>
            {in_stock_rate?.toFixed(1)}%
          </span>
          <span className="font-body-sm text-on-surface-variant">
            Target: &gt;= 95.0%
          </span>
        </div>
      </div>

      {/* Shelf Capacity */}
      <div className="bg-white rounded-DEFAULT border border-surface-variant p-md flex flex-col justify-between shadow-ambient h-[104px]">
        <div className="flex justify-between items-start w-full">
          <span className="font-label-md text-on-surface-variant uppercase tracking-wider">
            Shelf Capacity
          </span>
          <span className={`material-symbols-outlined ${shelfColor} text-sm`}>
            {shelfIcon}
          </span>
        </div>
        <div className="flex justify-between items-end w-full">
          <span className={`font-headline-md ${shelfColor}`}>
            {shelf_capacity?.toFixed(1)}%
          </span>
          <span className="font-body-sm text-on-surface-variant">
            Target: &lt;= 90.0%
          </span>
        </div>
      </div>
    </section>
  );
}
