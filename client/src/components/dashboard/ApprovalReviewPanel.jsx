import React from "react";

export default function ApprovalReviewPanel({
  scenarioDetails,
  loading,
  onSubmit,
  submitting,
}) {
  if (loading) {
    return (
      <div className="bg-[#1E293B] border border-[#475569] rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex-1 flex flex-col justify-center items-center min-h-[300px]">
        <div className="text-on-surface-variant">
          Loading scenario details...
        </div>
      </div>
    );
  }

  if (!scenarioDetails) {
    return (
      <div className="bg-[#1E293B] border border-[#475569] rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex-1 flex flex-col justify-center items-center min-h-[300px]">
        <div className="text-on-surface-variant">No scenario selected.</div>
      </div>
    );
  }

  const { scenario_name, sku_actions, guardrails } = scenarioDetails;

  const hasAdd = Array.isArray(sku_actions?.add) && sku_actions.add.length > 0;
  const hasRemove =
    Array.isArray(sku_actions?.remove) && sku_actions.remove.length > 0;
  const hasSwap =
    Array.isArray(sku_actions?.swap) && sku_actions.swap.length > 0;

  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex-1 flex flex-col">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4 border-b border-[#334155] pb-2">
        Approval Review — {scenario_name || "N/A"} Scenario
      </h3>
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
        <div>
          <h4 className="font-data-label text-data-label text-[#94A3B8] uppercase mb-2">
            Summary
          </h4>
          <ul className="font-body-sm text-on-surface space-y-2">
            {hasAdd ? (
              <li className="flex items-start gap-2">
                <span className="text-primary material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  add
                </span>
                <span>
                  <strong>Add:</strong>{" "}
                  {sku_actions.add
                    .map(
                      (item) =>
                        `${item?.sku || "N/A"} (${item?.product_name || "N/A"})`,
                    )
                    .join(", ")}
                </span>
              </li>
            ) : (
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  remove_circle_outline
                </span>
                <span>No SKUs to add</span>
              </li>
            )}

            {hasRemove ? (
              <li className="flex items-start gap-2">
                <span className="text-error material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  remove
                </span>
                <span>
                  <strong>Remove:</strong>{" "}
                  {sku_actions.remove
                    .map(
                      (item) =>
                        `${item?.sku || "N/A"} (${item?.product_name || "N/A"})`,
                    )
                    .join(", ")}
                </span>
              </li>
            ) : (
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  remove_circle_outline
                </span>
                <span>No SKUs to remove</span>
              </li>
            )}

            {hasSwap ? (
              <li className="flex items-start gap-2">
                <span className="text-secondary-container material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  swap_horiz
                </span>
                <span>
                  <strong>Swap:</strong>{" "}
                  {sku_actions.swap
                    .map(
                      (item) =>
                        `${item?.remove_sku || "N/A"} (${item?.remove_name || "N/A"}) for ${item?.add_sku || "N/A"} (${item?.add_name || "N/A"})`,
                    )
                    .join(", ")}
                </span>
              </li>
            ) : (
              <li className="flex items-start gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  remove_circle_outline
                </span>
                <span>No SKUs to swap</span>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-data-label text-data-label text-[#94A3B8] uppercase mb-2">
            Guardrails
          </h4>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-[#162033] p-2 rounded border border-[#334155]">
              <span className="font-body-sm">PB% &gt; 20%</span>
              {guardrails?.private_brand_percentage_check === "PASS" ? (
                <span className="text-primary font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    check
                  </span>{" "}
                  PASS
                </span>
              ) : (
                <span className="text-error font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>{" "}
                  FAIL
                </span>
              )}
            </div>
            <div className="flex justify-between items-center bg-[#162033] p-2 rounded border border-[#334155]">
              <span className="font-body-sm">Total SKUs &lt; 500</span>
              {guardrails?.total_skus_check === "PASS" ? (
                <span className="text-primary font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    check
                  </span>{" "}
                  PASS
                </span>
              ) : (
                <span className="text-error font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>{" "}
                  FAIL
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4 mt-4 border-t border-[#334155]">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-fixed-dim text-on-primary font-bold py-3 rounded-lg shadow-lg transition-colors font-body-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">send</span>{" "}
          {submitting ? "Submitting..." : "Submit Assortment"}
        </button>
      </div>
    </div>
  );
}
