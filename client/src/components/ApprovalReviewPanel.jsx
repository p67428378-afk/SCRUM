import React from "react";

export default function ApprovalReviewPanel({
  selectedScenario,
  scenarioData,
  onSubmit,
  isSubmitting,
}) {
  const {
    actions_summary = { adds: 0, swaps: 0, removals: 0 },
    guardrails = [],
  } = scenarioData || {};

  // Check if any guardrail check fails
  const hasFailedGuardrail = guardrails.some(
    (g) => g.status?.toUpperCase() === "FAIL",
  );

  return (
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md flex-1 flex flex-col">
      <h3 className="font-title-lg text-title-lg text-on-surface mb-md">
        Approval Review ({selectedScenario})
      </h3>

      <div className="bg-surface-container-low rounded p-md mb-md flex justify-around text-center">
        <div>
          <div className="font-display-sm text-display-sm text-on-surface">
            {actions_summary.adds}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Adds
          </div>
        </div>
        <div className="w-px bg-surface-container-highest"></div>
        <div>
          <div className="font-display-sm text-display-sm text-on-surface">
            {actions_summary.swaps}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Swaps
          </div>
        </div>
        <div className="w-px bg-surface-container-highest"></div>
        <div>
          <div className="font-display-sm text-display-sm text-on-surface">
            {actions_summary.removals}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Removals
          </div>
        </div>
      </div>

      <div className="mb-lg flex-1">
        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase mb-sm">
          Guardrail Checks
        </h4>
        <ul className="space-y-sm">
          {guardrails.map((g, idx) => {
            const isPass = g.status?.toUpperCase() === "PASS";
            return (
              <li
                key={idx}
                className="flex items-center justify-between p-sm border border-surface-container-highest rounded bg-surface-bright/50"
              >
                <span className="font-body-md text-body-md text-on-surface">
                  {g.name}
                </span>
                <div
                  className={`flex items-center gap-xs font-label-md text-label-md ${isPass ? "text-[#16a34a]" : "text-[#dc2626]"}`}
                >
                  <span>
                    {g.status} ({g.value})
                  </span>
                  <span className="material-symbols-outlined text-[18px]">
                    {isPass ? "check_circle" : "cancel"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting || hasFailedGuardrail}
        className={`w-full bg-primary-container text-on-primary-fixed font-title-md text-title-md py-md rounded font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-sm ${
          isSubmitting || hasFailedGuardrail
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <span className="material-symbols-outlined">send</span>
        {isSubmitting ? "Submitting..." : "Submit Assortment Plan"}
      </button>
    </div>
  );
}
