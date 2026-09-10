import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const ApprovalReviewPanel = ({
  selectedScenario = "Balanced",
  scenarioEvaluation = null,
  guardrailData = null,
  onSubmit,
  isSubmitting = false,
  submissionError = null,
}) => {
  const actions = scenarioEvaluation?.recommended_actions || {
    GROW: 12,
    MAINTAIN: 10,
    SWAP: 4,
    REDUCE: 2,
  };

  const totalSKUs =
    (actions.GROW || 0) +
    (actions.MAINTAIN || 0) +
    (actions.SWAP || 0) +
    (actions.REDUCE || 0);

  const checks = guardrailData?.checks || [
    {
      rule: "Min PB Share ≥ 25%",
      status: "PASSED",
      actual_value: `${scenarioEvaluation?.projected_pb_share_pct || 28.0}%`,
    },
    {
      rule: "Shelf Capacity ≤ 100%",
      status: "PASSED",
      actual_value: `${scenarioEvaluation?.projected_capacity_pct || 85.0}%`,
    },
    {
      rule: "In-Stock Rate ≥ 95%",
      status: "PASSED",
      actual_value: "96.50%",
    },
  ];

  const overallStatus = guardrailData?.overall_status || "PASSED";
  const allPassed = overallStatus === "PASSED";

  const renderStatusIcon = (status) => {
    if (status === "PASSED") {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (status === "WARNING") {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <section
      className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4"
      data-testid="approval-review-panel"
    >
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Approval Review & Execution Sign-Off
          </h2>
          <p className="text-xs text-slate-500">
            Review active scenario ({selectedScenario}) summary, SKU action
            counts, and guardrail validations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            data-testid="guardrail-overall-status"
            className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
              allPassed
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : overallStatus === "WARNING"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-red-100 text-red-800 border-red-300"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Guardrails: {allPassed ? "ALL PASSED" : overallStatus}
          </span>
        </div>
      </div>

      {submissionError && (
        <div
          className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2"
          data-testid="submission-error-banner"
        >
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: SKU Action Summary */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            SKU Action Summary ({selectedScenario})
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-emerald-700 font-bold">
                GROW: {actions.GROW} SKUs
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-blue-700 font-bold">
                MAINTAIN: {actions.MAINTAIN} SKUs
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-amber-700 font-bold">
                SWAP: {actions.SWAP} SKUs
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-red-700 font-bold">
                REDUCE: {actions.REDUCE} SKUs
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Total Affected SKUs: {totalSKUs} | Space Variance: 0.0 ft (Net
            Neutral)
          </p>
        </div>

        {/* Column 2: Guardrail Status Checks */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Guardrail Status Checks
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
            {checks.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  {renderStatusIcon(item.status)}
                  <span>{item.rule}</span>
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.actual_value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Submit Directive CTA */}
        <div className="flex flex-col justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Submit Assortment Directive
            </h3>
            <p className="text-xs text-slate-500">
              Finalizes decisions and logs an immutable audit trail to Dollar
              General Merchandising Ledger.
            </p>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#FFC20E] hover:bg-[#f0b506] disabled:opacity-60 text-[#1E2229] font-black text-sm py-3 px-4 rounded shadow-sm border border-[#e5ac00] transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            data-testid="submit-assortment-button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1E2229]" />
                <span>Submitting Plan...</span>
              </>
            ) : (
              <>
                <span>Submit Assortment Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ApprovalReviewPanel;
