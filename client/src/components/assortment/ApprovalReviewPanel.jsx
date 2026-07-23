import React from "react";

export default function ApprovalReviewPanel({
  selectedScenario,
  onSubmit,
  submitting,
}) {
  const scenario = selectedScenario || {
    name: "Balanced",
    actions: [
      {
        action: "GROW",
        sku_id: "SNC-001",
        product_name: "Spicy Nacho Chips",
        reason: "High margin potential",
      },
      {
        action: "ADD",
        sku_id: "NEW-001",
        product_name: "Private Label Chips",
        reason: "Fills category gap",
      },
      {
        action: "SWAP",
        sku_id: "SPT-004",
        product_name: "Salted Pretzel Twists",
        reason: "Replace with local brand",
      },
      {
        action: "REDUCE",
        sku_id: "SCC-005",
        product_name: "Sweet Caramel Corn",
        reason: "Declining velocity",
      },
    ],
    guardrails: [
      { name: "Supply Chain Capacity", status: "PASSED" },
      { name: "Margin Protection", status: "PASSED" },
      { name: "Space Constraints", status: "PASSED" },
    ],
  };

  const getActionIcon = (action) => {
    switch (action?.toUpperCase()) {
      case "ADD":
      case "GROW":
        return (
          <span className="material-symbols-outlined text-emerald-400 text-[20px] mt-0.5">
            add_circle
          </span>
        );
      case "SWAP":
        return (
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">
            swap_horiz
          </span>
        );
      case "REDUCE":
      case "REMOVE":
        return (
          <span className="material-symbols-outlined text-rose-400 text-[20px] mt-0.5">
            remove_circle
          </span>
        );
      default:
        return (
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">
            help
          </span>
        );
    }
  };

  const getActionText = (action, skuId, productName) => {
    const name = productName || skuId;
    switch (action?.toUpperCase()) {
      case "ADD":
        return (
          <>
            Add <span className="font-bold">{skuId}</span> ({name})
          </>
        );
      case "GROW":
        return (
          <>
            Grow <span className="font-bold">{skuId}</span> ({name})
          </>
        );
      case "SWAP":
        return (
          <>
            Swap <span className="font-bold">{skuId}</span> ({name})
          </>
        );
      case "REDUCE":
        return (
          <>
            Reduce <span className="font-bold">{skuId}</span> ({name})
          </>
        );
      case "REMOVE":
        return (
          <>
            Remove <span className="font-bold">{skuId}</span> ({name})
          </>
        );
      default:
        return (
          <>
            {action} <span className="font-bold">{skuId}</span>
          </>
        );
    }
  };

  const getActionReason = (action, skuId) => {
    if (skuId === "SNC-001") return "High margin potential";
    if (skuId === "NEW-001") return "Fills category gap";
    if (skuId === "SPT-004") return "Replace with local brand";
    if (skuId === "SCC-005") return "Declining velocity";
    return "Optimized performance";
  };

  return (
    <div className="xl:col-span-4 bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-6 sticky top-0 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
      <div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
          Scenario Approval Review
        </h3>
        <div className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-4">
          {scenario.name} Strategy Selected
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          This strategy optimizes for steady growth while increasing private
          brand penetration within acceptable risk parameters.
        </p>
      </div>

      {/* SKU Action List */}
      <div className="space-y-3">
        <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider border-b border-outline-variant pb-2">
          Key SKU Actions
        </h4>
        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
          {scenario.actions?.map((act, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-md bg-surface-container border border-outline-variant"
            >
              {getActionIcon(act.action)}
              <div>
                <p className="font-data-mono text-sm text-on-surface">
                  {getActionText(act.action, act.sku_id, act.product_name)}
                </p>
                <p className="font-label-md text-xs text-on-surface-variant mt-1">
                  {act.reason || getActionReason(act.action, act.sku_id)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guardrails */}
      <div className="space-y-3 mt-auto">
        <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider border-b border-outline-variant pb-2">
          Guardrail Checks
        </h4>
        <div className="space-y-2">
          {(
            scenario.guardrails || [
              { name: "Supply Chain Capacity", status: "PASSED" },
              { name: "Margin Protection", status: "PASSED" },
              { name: "Space Constraints", status: "PASSED" },
            ]
          ).map((guard, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="font-body-md text-sm text-on-surface-variant">
                {guard.name}
              </span>
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">
                check_circle
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full py-4 mt-4 bg-primary text-on-primary rounded-lg font-headline-md text-headline-md hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(192,193,255,0.4)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onSubmit}
        disabled={submitting}
      >
        <span className="material-symbols-outlined">send</span>
        {submitting ? "Submitting..." : "Submit Assortment Plan"}
      </button>
    </div>
  );
}
