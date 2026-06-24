import React from "react";
import CountUp from "react-countup";

export default function KPIHeaderStrip({ kpiMetrics }) {
  const {
    sales_per_linear_ft = 0,
    private_brand_pct = 0,
    in_stock_rate = 0,
    shelf_capacity = 0,
  } = kpiMetrics || {};

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-6">
      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
        <p class="font-label-caps text-label-caps text-on-secondary-container uppercase mb-1">
          Sales / Linear Ft
        </p>
        <div class="flex items-baseline gap-2">
          <h3 class="font-display-lg text-display-lg text-on-surface">
            $<CountUp end={sales_per_linear_ft} decimals={2} duration={1} />
          </h3>
          <span class="font-data-tabular text-data-tabular text-primary flex items-center bg-primary-fixed-dim/20 px-1.5 py-0.5 rounded text-[11px]">
            <span class="material-symbols-outlined text-[14px]">
              arrow_upward
            </span>{" "}
            8.2%
          </span>
        </div>
      </div>

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
        <p class="font-label-caps text-label-caps text-on-secondary-container uppercase mb-1">
          Private Brand %
        </p>
        <div class="flex items-baseline gap-2">
          <h3 class="font-display-lg text-display-lg text-on-surface">
            <CountUp end={private_brand_pct} decimals={1} duration={1} />%
          </h3>
          <span class="font-data-tabular text-data-tabular text-on-primary-container flex items-center bg-primary-container/20 px-1.5 py-0.5 rounded text-[11px]">
            Target 30%
          </span>
        </div>
      </div>

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
        <p class="font-label-caps text-label-caps text-on-secondary-container uppercase mb-1">
          In-Stock %
        </p>
        <div class="flex items-baseline gap-2">
          <h3 class="font-display-lg text-display-lg text-on-surface">
            <CountUp end={in_stock_rate} decimals={1} duration={1} />%
          </h3>
          <span class="font-data-tabular text-data-tabular text-primary flex items-center bg-primary-fixed-dim/20 px-1.5 py-0.5 rounded text-[11px]">
            <span class="material-symbols-outlined text-[14px]">
              arrow_upward
            </span>{" "}
            1.1%
          </span>
        </div>
      </div>

      <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between">
        <p class="font-label-caps text-label-caps text-on-secondary-container uppercase mb-1">
          Shelf Capacity
        </p>
        <div class="flex items-baseline gap-2">
          <h3 class="font-display-lg text-display-lg text-on-surface">
            <CountUp end={shelf_capacity} decimals={1} duration={1} />%
          </h3>
          <span class="font-data-tabular text-data-tabular text-primary flex items-center bg-primary-fixed-dim/20 px-1.5 py-0.5 rounded text-[11px]">
            Optimal
          </span>
        </div>
      </div>
    </div>
  );
}
