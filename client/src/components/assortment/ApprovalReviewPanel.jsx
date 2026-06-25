import React from "react";
import PropTypes from "prop-types";

export default function ApprovalReviewPanel({
  scenario,
  onSubmit,
  isSubmitting,
}) {
  const scenarioName = scenario?.scenario_name || "Balanced";
  const skuActions = scenario?.sku_actions || [];
  const guardrails = scenario?.guardrails || [];

  // Calculate counts
  const growCount = skuActions.filter(
    (a) => a.action?.toUpperCase() === "GROW",
  ).length;
  const maintainCount = skuActions.filter(
    (a) => a.action?.toUpperCase() === "MAINTAIN",
  ).length;
  const swapCount = skuActions.filter(
    (a) => a.action?.toUpperCase() === "SWAP",
  ).length;
  const reduceCount = skuActions.filter(
    (a) => a.action?.toUpperCase() === "REDUCE",
  ).length;

  // Check if all guardrails are met
  const allGuardrailsMet =
    guardrails.length > 0 &&
    guardrails.every((g) => g.status?.toUpperCase() === "MET");

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-5 border-t-4 border-t-primary-container">
      <h3 className="text-headline-md font-headline-md text-on-surface border-b border-surface-variant pb-3">
        Approval Review: {scenarioName} Scenario
      </h3>

      <div className="flex flex-col gap-2 text-body-sm">
        <div className="flex justify-between py-1">
          <span className="text-secondary">SKUs to Grow:</span>
          <span className="font-semibold text-status-grow-text">
            {growCount}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-secondary">SKUs to Maintain:</span>
          <span className="font-semibold text-status-maintain-text">
            {maintainCount}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-secondary">SKUs to Swap:</span>
          <span className="font-semibold text-status-swap-text">
            {swapCount}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-secondary">SKUs to Reduce:</span>
          <span className="font-semibold text-status-reduce-text">
            {reduceCount}
          </span>
        </div>
      </div>

      <div className="bg-surface-bright rounded-lg p-4 border border-surface-variant flex flex-col gap-3">
        <h4 className="text-label-caps font-label-caps text-secondary uppercase tracking-wider mb-1">
          Guardrail Checks
        </h4>
        {guardrails.length === 0 ? (
          <p className="text-body-sm text-secondary">No guardrails defined.</p>
        ) : (
          guardrails.map((guardrail, index) => {
            const isMet = guardrail.status?.toUpperCase() === "MET";
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-body-sm font-medium">
                  {guardrail.name}
                </span>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-bold ${
                    isMet
                      ? "text-status-grow-text bg-status-grow-bg/50"
                      : "text-status-reduce-text bg-status-reduce-bg/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isMet ? "check" : "close"}
                  </span>
                  {guardrail.status}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!allGuardrailsMet || isSubmitting}
        className={`w-full font-headline-md font-semibold py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 ${
          allGuardrailsMet && !isSubmitting
            ? "bg-primary-container hover:bg-primary-container/90 text-on-primary-container cursor-pointer"
            : "bg-surface-container text-secondary cursor-not-allowed opacity-60"
        }`}
      >
        <span className="material-symbols-outlined">
          {isSubmitting ? "hourglass_empty" : "send"}
        </span>
        {isSubmitting ? "Submitting..." : "Submit Assortment Decisions"}
      </button>
    </div>
  );
}

ApprovalReviewPanel.propTypes = {
  scenario: PropTypes.shape({
    scenario_name: PropTypes.string,
    sku_actions: PropTypes.arrayOf(
      PropTypes.shape({
        sku_id: PropTypes.string,
        action: PropTypes.string,
      }),
    ),
    guardrails: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        status: PropTypes.string,
      }),
    ),
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};
