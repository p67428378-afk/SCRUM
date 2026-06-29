import React from "react";
import PropTypes from "prop-types";

export default function ApprovalReviewPanel({
  scenarioData,
  onSubmit,
  isSubmitting,
}) {
  if (!scenarioData) {
    return (
      <div className="bg-surface-container-high border border-outline-variant rounded-xl shadow-md p-md flex flex-col flex-1 animate-pulse h-96"></div>
    );
  }

  const { sku_action_summary, guardrails, name } = scenarioData;

  return (
    <div className="bg-surface-container-high border border-outline-variant rounded-xl shadow-md p-md flex flex-col flex-1">
      <h2 className="font-headline-md text-on-surface mb-md font-semibold text-lg">
        Assortment Review
      </h2>

      <div className="mb-md">
        <h3 className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider text-xs font-semibold">
          Proposed Actions{name ? ` (${name.toUpperCase()})` : ""}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="text-on-surface">Grow footprint</span>
            </div>
            <span className="font-data-mono font-bold text-on-surface">
              {sku_action_summary?.grow || 0} SKUs
            </span>
          </li>
          <li className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span className="text-on-surface">Swap items</span>
            </div>
            <span className="font-data-mono font-bold text-on-surface">
              {sku_action_summary?.swap || 0} SKUs
            </span>
          </li>
          <li className="flex items-center justify-between text-body-sm">
            <div className="flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
              <span className="text-on-surface">Reduce/Delist</span>
            </div>
            <span className="font-data-mono font-bold text-on-surface">
              {sku_action_summary?.reduce || 0} SKUs
            </span>
          </li>
        </ul>
      </div>

      <div className="mb-lg flex-1">
        <h3 className="font-label-md text-on-surface-variant mb-2 uppercase tracking-wider text-xs font-semibold">
          Guardrail Checks
        </h3>
        <div className="space-y-3 bg-surface-container-lowest p-sm rounded-lg border border-outline-variant/50">
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-on-surface">
              Private Brand % Goal
            </span>
            {guardrails?.private_brand_goal_met ? (
              <span className="material-symbols-outlined text-[#10B981] fill text-[18px]">
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-error fill text-[18px]">
                cancel
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-on-surface">
              Shelf Capacity Limit
            </span>
            {guardrails?.shelf_space_limit_ok ? (
              <span className="material-symbols-outlined text-[#10B981] fill text-[18px]">
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-error fill text-[18px]">
                cancel
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body-sm text-on-surface">
              In-Stock Rate Baseline
            </span>
            <span className="material-symbols-outlined text-[#10B981] fill text-[18px]">
              check_circle
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary-container text-on-primary-fixed font-headline-md text-sm py-3 px-4 rounded-lg font-bold hover:bg-primary-fixed transition-colors shadow-sm flex justify-center items-center gap-sm mt-auto disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Assortment Review"}
        <span className="material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </button>
    </div>
  );
}

ApprovalReviewPanel.propTypes = {
  scenarioData: PropTypes.shape({
    name: PropTypes.string,
    sku_action_summary: PropTypes.shape({
      grow: PropTypes.number,
      swap: PropTypes.number,
      reduce: PropTypes.number,
    }),
    guardrails: PropTypes.shape({
      private_brand_goal_met: PropTypes.bool,
      shelf_space_limit_ok: PropTypes.bool,
    }),
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};
