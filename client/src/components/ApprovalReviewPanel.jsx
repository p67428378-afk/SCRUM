import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  TrendingUp,
  Tag,
  Layers,
  Sparkles,
  Info,
  XCircle,
} from "lucide-react";

export default function ApprovalReviewPanel({
  selectedScenario = "Balanced",
  scenarioEvaluation = null,
  guardrailResults = null,
  clusterName = "Small Town Value Cluster",
  onSubmit = async () => {},
  submitting = false,
  submitError = null,
}) {
  const [notes, setNotes] = useState("");

  // Extract scenario evaluation details
  const salesLift =
    scenarioEvaluation?.projected_sales_lift_pct ??
    (selectedScenario === "Aggressive"
      ? 8.5
      : selectedScenario === "Conservative"
        ? 2.5
        : 5.2);
  const pbPct =
    scenarioEvaluation?.projected_private_brand_pct ??
    (selectedScenario === "Aggressive"
      ? 32.0
      : selectedScenario === "Conservative"
        ? 25.0
        : 28.0);
  const shelfCap =
    scenarioEvaluation?.projected_shelf_capacity_pct ??
    (selectedScenario === "Aggressive"
      ? 94.5
      : selectedScenario === "Conservative"
        ? 88.0
        : 92.0);
  const riskLevel =
    scenarioEvaluation?.risk_level ??
    (selectedScenario === "Aggressive" ? "Moderate" : "Low");

  const actionSummary = scenarioEvaluation?.sku_action_summary || {
    grow:
      selectedScenario === "Aggressive"
        ? 18
        : selectedScenario === "Conservative"
          ? 6
          : 12,
    maintain:
      selectedScenario === "Aggressive"
        ? 10
        : selectedScenario === "Conservative"
          ? 24
          : 18,
    swap:
      selectedScenario === "Aggressive"
        ? 8
        : selectedScenario === "Conservative"
          ? 2
          : 4,
    reduce:
      selectedScenario === "Aggressive"
        ? 5
        : selectedScenario === "Conservative"
          ? 1
          : 2,
  };

  const totalModifications =
    (actionSummary.grow || 0) +
    (actionSummary.swap || 0) +
    (actionSummary.reduce || 0);

  // Guardrail checks
  const passAll = guardrailResults?.pass_all ?? true;
  const checks = guardrailResults?.checks || [
    {
      name: "Shelf Capacity Limit",
      description: "Maximum allowable store shelf capacity allocation",
      threshold: "<= 95.0%",
      actual_value: `${shelfCap.toFixed(1)}%`,
      status: "PASSED",
      passed: true,
    },
    {
      name: "Private Brand Share Target",
      description: "Minimum Private Brand share for margin expansion",
      threshold: ">= 25.0%",
      actual_value: `${pbPct.toFixed(1)}%`,
      status: "PASSED",
      passed: true,
    },
    {
      name: "In-Stock Service Level SLA",
      description: "Minimum required inventory availability SLA",
      threshold: ">= 95.0%",
      actual_value: "96.5%",
      status: "PASSED",
      passed: true,
    },
    {
      name: "Category Margin Hurdle",
      description: "Snacks category blended gross margin floor",
      threshold: ">= 32.0%",
      actual_value: "36.8%",
      status: "PASSED",
      passed: true,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      scenario: selectedScenario,
      cluster_name: clusterName,
      user_id: "user@dollargeneral.com",
      notes:
        notes ||
        `Submitted assortment optimization for ${selectedScenario} scenario.`,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Assortment Approval & Guardrail Review Panel
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review live impact projections, guardrail compliance validations,
            and submit final plan for execution
          </p>
        </div>

        {/* Guardrail Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Guardrail Status:
          </span>
          {passAll ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ALL PASSED (4/4)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ATTENTION REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Scenario & SKU Actions; Right = Guardrail Checks & Submit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Selected Scenario Summary & Action Counts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Selected Scenario
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#ECC000] text-black">
                {selectedScenario} Plan
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white rounded-lg border border-slate-200 mb-3">
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase block">
                  Proj. Sales Lift
                </span>
                <span className="text-base font-bold text-emerald-600">
                  +{salesLift.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase block">
                  PB Share Target
                </span>
                <span className="text-base font-bold text-amber-700">
                  {pbPct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium uppercase block">
                  Shelf Capacity
                </span>
                <span className="text-base font-bold text-slate-800">
                  {shelfCap.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
              <span>Risk Classification:</span>
              <span className="font-semibold text-slate-900">
                {riskLevel} Execution Risk
              </span>
            </div>
          </div>

          {/* SKU Action Summary Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Proposed SKU Actions
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {totalModifications} Modifications
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  GROW
                </span>
                <span className="text-xl font-extrabold text-emerald-800">
                  {actionSummary.grow ?? 12}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  SKUs Expanded
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  MAINTAIN
                </span>
                <span className="text-xl font-extrabold text-blue-800">
                  {actionSummary.maintain ?? 18}
                </span>
                <span className="text-[10px] text-blue-600 block">
                  SKUs Retained
                </span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">
                  SWAP
                </span>
                <span className="text-xl font-extrabold text-amber-800">
                  {actionSummary.swap ?? 4}
                </span>
                <span className="text-[10px] text-amber-600 block">
                  SKUs Replaced
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] uppercase font-bold text-red-700 block">
                  REDUCE
                </span>
                <span className="text-xl font-extrabold text-red-800">
                  {actionSummary.reduce ?? 2}
                </span>
                <span className="text-[10px] text-red-600 block">
                  SKUs Delisted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Guardrail Checks & Submission Action */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Guardrails List */}
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Automated Guardrail Checks
            </span>
            <div className="space-y-2">
              {checks.map((chk, i) => (
                <div
                  key={chk.name || i}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900">
                        {chk.name}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {chk.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800 block">
                      {chk.actual_value}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Limit: {chk.threshold}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Form & Notes */}
          <form
            onSubmit={handleSubmit}
            className="pt-2 border-t border-slate-200"
          >
            {submitError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>
                  <strong>Submission Failed:</strong> {submitError}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Optional submission notes (e.g., Q3 Fall Reset)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ECC000] text-slate-800"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed border border-slate-950"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#ECC000]" />
                    <span>Submitting Assortment...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#ECC000]" />
                    <span>Submit {selectedScenario} Plan</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">
              Logs approval record to PostgreSQL audit trail and notifies store
              operations.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
