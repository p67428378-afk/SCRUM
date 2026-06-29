import React from "react";
import PropTypes from "prop-types";

export default function KpiStrip({ kpis }) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-low border border-outline-variant rounded-xl p-md h-32"
          ></div>
        ))}
      </div>
    );
  }

  const {
    sales_per_linear_ft,
    private_brand_pct,
    in_stock_rate,
    shelf_capacity,
  } = kpis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
      {/* KPI 1: Sales per Linear Ft */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm hover:bg-surface-bright/5 transition-colors group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-container/20 pointer-events-none"></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="font-body-sm text-on-surface-variant">
            {sales_per_linear_ft?.label || "Sales per Linear Ft"}
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            attach_money
          </span>
        </div>
        <div className="font-headline-lg text-on-surface mb-1 relative z-10 font-bold text-2xl">
          $
          {sales_per_linear_ft?.value
            ? sales_per_linear_ft.value.toFixed(2)
            : "0.00"}
        </div>
        <div className="flex items-center gap-xs font-body-sm text-[#10B981] relative z-10">
          <span className="material-symbols-outlined text-[16px]">
            {sales_per_linear_ft?.trend === "up"
              ? "trending_up"
              : sales_per_linear_ft?.trend === "down"
                ? "trending_down"
                : "trending_flat"}
          </span>
          <span>
            {sales_per_linear_ft?.trend === "up"
              ? "+8.4% vs last month"
              : "Stable"}
          </span>
        </div>
      </div>

      {/* KPI 2: Private Brand % */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm hover:bg-surface-bright/5 transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="font-body-sm text-on-surface-variant">
            {private_brand_pct?.label || "Private Brand %"}
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            local_mall
          </span>
        </div>
        <div className="font-headline-lg text-on-surface mb-1 font-bold text-2xl">
          {private_brand_pct?.value
            ? `${private_brand_pct.value.toFixed(1)}%`
            : "0.0%"}
        </div>
        <div className="flex items-center justify-between font-body-sm text-on-surface-variant mb-2">
          <span>30.0% Target</span>
        </div>
        <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary-container h-1.5 rounded-full"
            style={{
              width: `${Math.min(100, ((private_brand_pct?.value || 0) / 30.0) * 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* KPI 3: In-Stock Rate */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm hover:bg-surface-bright/5 transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="font-body-sm text-on-surface-variant">
            {in_stock_rate?.label || "In-Stock Rate"}
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            inventory_2
          </span>
        </div>
        <div className="font-headline-lg text-on-surface mb-1 font-bold text-2xl">
          {in_stock_rate?.value ? `${in_stock_rate.value.toFixed(1)}%` : "0.0%"}
        </div>
        <div className="flex items-center gap-xs font-body-sm text-[#10B981]">
          <span className="material-symbols-outlined text-[16px] fill">
            check_circle
          </span>
          <span>Goal Met</span>
        </div>
      </div>

      {/* KPI 4: Shelf Capacity */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm hover:bg-surface-bright/5 transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <span className="font-body-sm text-on-surface-variant">
            {shelf_capacity?.label || "Shelf Capacity"}
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">
            shelves
          </span>
        </div>
        <div className="font-headline-lg text-on-surface mb-1 font-bold text-2xl">
          {shelf_capacity?.value
            ? `${shelf_capacity.value.toFixed(1)}%`
            : "0.0%"}
        </div>
        <div className="flex items-center gap-xs font-body-sm text-[#10B981] mb-2">
          <span>Within Limit</span>
        </div>
        <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-secondary-fixed h-1.5 rounded-full"
            style={{ width: `${shelf_capacity?.value || 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

KpiStrip.propTypes = {
  kpis: PropTypes.shape({
    sales_per_linear_ft: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      trend: PropTypes.string,
    }),
    private_brand_pct: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      trend: PropTypes.string,
    }),
    in_stock_rate: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      trend: PropTypes.string,
    }),
    shelf_capacity: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
      trend: PropTypes.string,
    }),
  }),
};
