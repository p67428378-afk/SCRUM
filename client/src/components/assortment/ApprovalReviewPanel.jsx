import React from "react";

export default function ApprovalReviewPanel({
  selectedScenario,
  skuActions = {},
  onSubmit,
  isSubmitting = false,
}) {
  if (!selectedScenario) return null;

  const { projected_impact = {}, guardrails = {} } = selectedScenario;

  // Calculate action counts from current state
  const counts = { GROW: 0, MAINTAIN: 0, REDUCE: 0, SWAP: 0 };
  Object.values(skuActions).forEach((action) => {
    const upper = action.toUpperCase();
    if (counts[upper] !== undefined) {
      counts[upper]++;
    }
  });

  return (
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col shadow-[0px_4px_12px_rgba(15,23,42,0.08)]">
      <h3 class="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-3 mb-4">
        Approval Review Panel — {selectedScenario.name} Scenario
      </h3>

      <div class="mb-5">
        <p class="font-label-caps text-label-caps text-secondary uppercase mb-2">
          Projected Impact
        </p>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-surface p-2 rounded border border-outline-variant/50">
            <p class="font-mono-label text-mono-label text-secondary mb-1">
              Sales / Lin Ft
            </p>
            <p class="font-data-tabular text-data-tabular font-bold text-primary">
              ${projected_impact.sales_per_linear_ft || "0"}
            </p>
          </div>
          <div class="bg-surface p-2 rounded border border-outline-variant/50">
            <p class="font-mono-label text-mono-label text-secondary mb-1">
              In-Stock Rate
            </p>
            <p class="font-data-tabular text-data-tabular font-bold text-primary">
              {projected_impact.in_stock_rate || "0"}%
            </p>
          </div>
          <div class="bg-surface p-2 rounded border border-outline-variant/50">
            <p class="font-mono-label text-mono-label text-secondary mb-1">
              PB %
            </p>
            <p class="font-data-tabular text-data-tabular font-bold text-on-surface">
              {projected_impact.private_brand_pct || "0"}%
            </p>
          </div>
          <div class="bg-surface p-2 rounded border border-outline-variant/50">
            <p class="font-mono-label text-mono-label text-secondary mb-1">
              Shelf Capacity
            </p>
            <p class="font-data-tabular text-data-tabular font-bold text-on-surface">
              {projected_impact.shelf_capacity || "0"}%
            </p>
          </div>
        </div>
      </div>

      <div class="mb-5">
        <p class="font-label-caps text-label-caps text-secondary uppercase mb-2">
          Action Summary
        </p>
        <div class="flex flex-wrap gap-2">
          <span class="px-2 py-1 rounded text-[11px] font-bold bg-[#dcfce7] text-[#166534]">
            GROW {counts.GROW}
          </span>
          <span class="px-2 py-1 rounded text-[11px] font-bold bg-[#e0f2fe] text-[#075985]">
            MAINTAIN {counts.MAINTAIN}
          </span>
          <span class="px-2 py-1 rounded text-[11px] font-bold bg-[#ffedd5] text-[#9a3412]">
            SWAP {counts.SWAP}
          </span>
          <span class="px-2 py-1 rounded text-[11px] font-bold bg-[#fee2e2] text-[#991b1b]">
            REDUCE {counts.REDUCE}
          </span>
        </div>
      </div>

      <div class="mb-6">
        <p class="font-label-caps text-label-caps text-secondary uppercase mb-2">
          Guardrails
        </p>
        <ul class="flex flex-col gap-2">
          <li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
            <span
              class={`material-symbols-outlined text-[18px] ${
                guardrails.shelf_capacity_within_limits
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {guardrails.shelf_capacity_within_limits
                ? "check_circle"
                : "cancel"}
            </span>
            Shelf Capacity Within Limits
          </li>
          <li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
            <span
              class={`material-symbols-outlined text-[18px] ${
                guardrails.private_brand_target_met
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {guardrails.private_brand_target_met ? "check_circle" : "cancel"}
            </span>
            Private Brand Target Met
          </li>
          <li class="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
            <span
              class={`material-symbols-outlined text-[18px] ${
                guardrails.in_stock_rate_above_minimum
                  ? "text-primary"
                  : "text-error"
              }`}
            >
              {guardrails.in_stock_rate_above_minimum
                ? "check_circle"
                : "cancel"}
            </span>
            In-Stock Rate Above Minimum
          </li>
        </ul>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        class="w-full py-3 bg-primary-container text-[#0F172A] font-title-sm text-title-sm font-bold rounded-md hover:bg-primary-fixed transition-colors shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? "Submitting Plan..." : "Submit Assortment Plan"}
      </button>
    </div>
  );
}
