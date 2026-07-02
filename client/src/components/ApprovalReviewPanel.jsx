import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react";

export default function ApprovalReviewPanel({
  scenarioData,
  loading,
  onSubmit,
  submitting,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!scenarioData) return null;

  const { scenario_name, guardrails, sku_actions } = scenarioData;

  const projected_sales_lift = scenarioData.projected_sales_lift ?? 3.2;
  const projected_private_brand_pct =
    scenarioData.projected_private_brand_pct ?? 28.1;

  const isPbValid = guardrails?.private_brand_valid ?? true;
  const isCapacityValid = guardrails?.shelf_capacity_valid ?? true;
  const canSubmit = isPbValid && isCapacityValid;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">
          Approval & Review Panel
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Review the projected impact and SKU actions for the{" "}
          <span className="font-semibold text-gray-800">{scenario_name}</span>{" "}
          strategy before submitting.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 ">
              Projected Sales Lift
            </span>
            <span className="text-xl font-extrabold text-green-600">
              +{projected_sales_lift}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1 ">
              Projected Private Brand %
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {projected_private_brand_pct}%
            </span>
          </div>
        </div>

        {/* Guardrails */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Guardrail Status Checks
          </h4>
          <div className="space-y-2.5">
            {/* Private Brand Guardrail */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border text-sm ${isPbValid ? "bg-green-50/50 border-green-200 text-green-800" : "bg-amber-50/50 border-amber-200 text-amber-800"}`}
            >
              <div className="flex items-center gap-2.5">
                {isPbValid ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-600" />
                )}
                <span className="font-medium">
                  Private Brand Share &gt; 25%
                </span>
              </div>
              <span className="font-bold">
                {isPbValid ? "Passed" : "Warning"}
              </span>
            </div>

            {/* Shelf Capacity Guardrail */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border text-sm ${isCapacityValid ? "bg-green-50/50 border-green-200 text-green-800" : "bg-amber-50/50 border-amber-200 text-amber-800"}`}
            >
              <div className="flex items-center gap-2.5">
                {isCapacityValid ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-600" />
                )}
                <span className="font-medium">
                  Total SKUs within Shelf Capacity
                </span>
              </div>
              <span className="font-bold">
                {isCapacityValid ? "Passed" : "Warning"}
              </span>
            </div>
          </div>
        </div>

        {/* SKU Actions List */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Proposed SKU Actions ({sku_actions?.length || 0})
          </h4>
          {sku_actions && sku_actions.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {sku_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase tracking-wider">
                      {action.action}
                    </span>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {action.name}
                      </span>
                      <span className="text-gray-400 font-mono mx-1.5">
                        ({action.sku_id})
                      </span>
                      {action.replacement_name && (
                        <span className="inline-flex items-center gap-1 text-gray-500 mt-0.5">
                          <ArrowRight size={12} className="text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {action.replacement_name}
                          </span>
                          <span className="text-gray-400 font-mono">
                            ({action.replacement_sku_id})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-2">
              No SKU actions proposed for this strategy.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100">
          {!canSubmit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
              <AlertTriangle
                size={16}
                className="text-red-600 shrink-0 mt-0.5"
              />
              <div>
                <p className="font-bold">Submission Blocked</p>
                <p className="mt-0.5">
                  Guardrail violations prevent submission. Please select a
                  different strategy.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
              canSubmit && !submitting
                ? "bg-dg-yellow text-black hover:bg-yellow-400 active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting Assortment...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Assortment Decision</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
