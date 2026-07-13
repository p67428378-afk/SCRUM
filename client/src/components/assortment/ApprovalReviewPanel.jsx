import React from "react";

export default function ApprovalReviewPanel({
  scenarioData,
  onSubmit,
  isSubmitting,
}) {
  if (!scenarioData) return null;

  const { scenario_name, sku_action_summary, guardrails } = scenarioData;

  return (
    <div className="card-surface rounded-xl p-md flex-1 flex flex-col">
      <h2 className="font-headline-sm text-headline-sm text-white mb-1">
        Approval Review
      </h2>
      <p className="font-body-sm text-sm text-slate-400 mb-4 pb-4 border-b border-slate-700">
        Review selected scenario:{" "}
        <span className="capitalize font-semibold text-white">
          {scenario_name}
        </span>
      </p>
      <div className="space-y-4 mb-6 flex-1">
        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
          <div className="font-label-caps text-xs text-slate-500 mb-2 uppercase">
            Action Summary
          </div>
          <div className="grid grid-cols-2 gap-2 font-data-tabular text-sm">
            <div className="text-emerald-400">
              Grow: {sku_action_summary?.grow} SKUs
            </div>
            <div className="text-sky-400">
              Maintain: {sku_action_summary?.maintain} SKUs
            </div>
            <div className="text-amber-400">
              Swap: {sku_action_summary?.swap} SKUs
            </div>
            <div className="text-red-400">
              Reduce: {sku_action_summary?.reduce} SKUs
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between font-data-tabular text-sm">
            <span className="text-slate-300">Shelf Capacity Check</span>
            <span className="text-emerald-500 flex items-center">
              <span className="mr-1">✓</span> {guardrails?.shelf_capacity_check}
            </span>
          </div>
          <div className="flex items-center justify-between font-data-tabular text-sm">
            <span className="text-slate-300">Private Brand Goal</span>
            <span className="text-emerald-500 flex items-center">
              <span className="mr-1">✓</span> {guardrails?.private_brand_goal}
            </span>
          </div>
          <div className="flex items-center justify-between font-data-tabular text-sm">
            <span className="text-slate-300">Margin Threshold</span>
            <span className="text-emerald-500 flex items-center">
              <span className="mr-1">✓</span> {guardrails?.margin_threshold}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full btn-primary font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50"
      >
        <span className="mr-2">✉</span>
        {isSubmitting ? "Submitting..." : "Submit Assortment Plan"}
      </button>
    </div>
  );
}
