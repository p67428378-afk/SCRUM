import React from "react";
import { DollarSign, Percent, CheckCircle2, Layers } from "lucide-react";

const KPIHeaderStrip = ({ kpiData, loading }) => {
  if (loading) {
    return (
      <section
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        data-testid="kpi-header-strip-loading"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm animate-pulse h-28"
          >
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </section>
    );
  }

  const salesPerLinearFt =
    kpiData?.sales_per_linear_ft !== undefined
      ? `$${Number(kpiData.sales_per_linear_ft).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "$0.00";

  const privateBrandPct =
    kpiData?.private_brand_percentage !== undefined
      ? `${Number(kpiData.private_brand_percentage).toFixed(1)}%`
      : "0.0%";

  const inStockRate =
    kpiData?.in_stock_rate !== undefined
      ? `${Number(kpiData.in_stock_rate).toFixed(1)}%`
      : "0.0%";

  const capacityUtil =
    kpiData?.shelf_capacity_utilization !== undefined
      ? `${Number(kpiData.shelf_capacity_utilization).toFixed(1)}%`
      : "0.0%";

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
      data-testid="kpi-header-strip"
    >
      {/* Card 1: Sales / Linear Ft */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sales / Linear Ft
          </p>
          <span className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>
        <p
          className="text-2xl font-bold text-slate-900 font-mono mt-1"
          data-testid="kpi-sales-value"
        >
          {salesPerLinearFt}
        </p>
        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <span>▲</span> +$42.50 vs Baseline Target
        </p>
      </div>

      {/* Card 2: Private Brand Share */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Private Brand Share
          </p>
          <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
            <Percent className="w-4 h-4" />
          </span>
        </div>
        <p
          className="text-2xl font-bold text-slate-900 font-mono mt-1"
          data-testid="kpi-pb-share-value"
        >
          {privateBrandPct}
        </p>
        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Clover Valley (Target ≥25.0%)
        </p>
      </div>

      {/* Card 3: In-Stock Rate */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            In-Stock Rate
          </p>
          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <p
          className="text-2xl font-bold text-slate-900 font-mono mt-1"
          data-testid="kpi-in-stock-value"
        >
          {inStockRate}
        </p>
        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> SLA Compliant (Target ≥95.0%)
        </p>
      </div>

      {/* Card 4: Shelf Capacity Utilization */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Shelf Capacity Utilization
          </p>
          <span className="p-1.5 bg-purple-50 text-purple-600 rounded-md">
            <Layers className="w-4 h-4" />
          </span>
        </div>
        <p
          className="text-2xl font-bold text-slate-900 font-mono mt-1"
          data-testid="kpi-capacity-value"
        >
          {capacityUtil}
        </p>
        <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block"></span>{" "}
          Optimal Facing Density (82-88%)
        </p>
      </div>
    </section>
  );
};

export default KPIHeaderStrip;
