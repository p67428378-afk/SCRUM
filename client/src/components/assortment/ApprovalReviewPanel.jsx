import React from "react";

export default function ApprovalReviewPanel({
  scenario,
  onSubmit,
  submitting,
  loading,
}) {
  if (loading || !scenario) {
    return (
      <div className="bg-dg-blue text-white rounded-DEFAULT shadow-ambient p-lg flex flex-col gap-md animate-pulse h-64">
        <div className="h-6 bg-blue-800 rounded w-1/2 mb-2"></div>
        <div className="h-12 bg-blue-800 rounded w-full mb-4"></div>
        <div className="h-10 bg-blue-800 rounded w-full"></div>
      </div>
    );
  }

  const {
    name,
    projected_private_brand_pct,
    projected_shelf_capacity,
    guardrails,
    sku_actions,
  } = scenario;

  // Count actions
  const actionCounts = sku_actions.reduce((acc, curr) => {
    acc[curr.action] = (acc[curr.action] || 0) + 1;
    return acc;
  }, {});

  const actionSummaryText = Object.entries(actionCounts)
    .map(
      ([action, count]) => `${count} SKU${count > 1 ? "s" : ""} to ${action}`,
    )
    .join(", ");

  const isPbPass = guardrails.private_brand_check === "PASS";
  const isShelfPass = guardrails.shelf_capacity_check === "PASS";

  return (
    <div className="bg-dg-blue text-white rounded-DEFAULT shadow-ambient p-lg flex flex-col gap-md relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-5 w-40 h-40">
        <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="50"></circle>
        </svg>
      </div>
      <div className="z-10 w-full">
        <h3 className="font-headline-sm mb-1">Approval Review</h3>
        <p className="font-body-sm text-white/80 mb-4">
          {name} Scenario Selected
        </p>

        <div className="bg-white/10 rounded-DEFAULT p-3 mb-4 border border-white/20">
          <p className="font-label-md text-dg-yellow uppercase tracking-wider mb-1">
            Action Summary
          </p>
          <p className="font-body-md font-medium">
            {actionSummaryText || "No actions required"}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {/* Private Brand Guardrail */}
          <div className="flex items-center gap-3 w-full">
            <span
              className={`material-symbols-outlined ${isPbPass ? "text-[#34A853]" : "text-[#D93025]"} filled-icon text-lg bg-white rounded-full`}
            >
              {isPbPass ? "check_circle" : "cancel"}
            </span>
            <span className="font-body-sm flex-1">Private Brand Pass</span>
            <span className="font-label-md font-bold">
              {projected_private_brand_pct}%
            </span>
          </div>

          {/* Shelf Capacity Guardrail */}
          <div className="flex items-center gap-3 w-full">
            <span
              className={`material-symbols-outlined ${isShelfPass ? "text-[#34A853]" : "text-[#D93025]"} filled-icon text-lg bg-white rounded-full`}
            >
              {isShelfPass ? "check_circle" : "cancel"}
            </span>
            <span className="font-body-sm flex-1">Shelf Capacity Pass</span>
            <span className="font-label-md font-bold">
              {projected_shelf_capacity}%
            </span>
          </div>

          {/* In-Stock Guardrail (Static or from scenario if available) */}
          <div className="flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-[#34A853] filled-icon text-lg bg-white rounded-full">
              check_circle
            </span>
            <span className="font-body-sm flex-1">In-Stock Pass</span>
            <span className="font-label-md font-bold">96.2%</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full bg-dg-yellow text-dg-blue font-bold font-label-lg py-3 rounded-DEFAULT hover:bg-[#FFE066] transition-colors shadow-sm active:translate-y-[1px] border-b-2 border-[#D9B300] active:border-b-0 disabled:bg-gray-400 disabled:text-gray-600 disabled:border-none"
        >
          {submitting ? "Submitting..." : "Submit Assortment Changes"}
        </button>
      </div>
    </div>
  );
}
