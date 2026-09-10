import React from "react";
import { CheckCircle2, X, FileText, Check, ShieldCheck } from "lucide-react";

const InlineConfirmationModal = ({
  isOpen = false,
  onClose,
  submissionResult = null,
  selectedScenario = "Balanced",
  scenarioEvaluation = null,
}) => {
  if (!isOpen || !submissionResult) {
    return null;
  }

  const actions = scenarioEvaluation?.recommended_actions || {
    GROW: 12,
    MAINTAIN: 10,
    SWAP: 4,
    REDUCE: 2,
  };

  const totalSKUs =
    submissionResult.total_sku_actions ||
    (actions.GROW || 0) +
      (actions.MAINTAIN || 0) +
      (actions.SWAP || 0) +
      (actions.REDUCE || 0);

  const formattedDate = submissionResult.submitted_at
    ? new Date(submissionResult.submitted_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    : new Date().toUTCString();

  const handleDownloadLog = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            audit_code: submissionResult.audit_code,
            submitted_by: submissionResult.user_id || "category_mgr_01",
            cluster: "Small Town Value Cluster",
            scenario: selectedScenario,
            total_actions: totalSKUs,
            action_breakdown: actions,
            submitted_at:
              submissionResult.submitted_at || new Date().toISOString(),
          },
          null,
          2,
        ),
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${submissionResult.audit_code}_audit_log.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      data-testid="inline-confirmation-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gold Bar */}
        <div className="h-1.5 bg-[#FFC20E] w-full"></div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h2
                  className="text-lg font-bold text-slate-900"
                  data-testid="confirmation-modal-title"
                >
                  Assortment Plan Submitted Successfully
                </h2>
                <p className="text-xs text-slate-500">
                  Directives logged to Dollar General Merchandising Ledger
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close modal"
              data-testid="close-modal-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audit Details Box */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans font-medium">
                Audit Code:
              </span>
              <span
                className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200"
                data-testid="audit-code-value"
              >
                {submissionResult.audit_code || "AUD-2026-0518-01"}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans font-medium">
                Submitted By:
              </span>
              <span className="text-slate-900 font-sans font-semibold">
                Marcus Vance ({submissionResult.user_id || "category_mgr_01"})
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-sans font-medium">
                Target Cluster:
              </span>
              <span className="text-slate-900 font-sans">
                Small Town Value Cluster
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans font-medium">
                Selected Scenario:
              </span>
              <span className="font-sans bg-[#FFC20E]/20 text-slate-900 font-bold px-2 py-0.5 rounded">
                {selectedScenario === "Balanced"
                  ? "Balanced Growth & Margin"
                  : selectedScenario === "Aggressive"
                    ? "Aggressive Private Brand"
                    : "Conservative Optimization"}
              </span>
            </div>
          </div>

          {/* Guardrails and Breakdown Box */}
          <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-emerald-900 gap-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Operational Guardrails: ALL PASSED
              </span>
              <span className="font-sans text-[11px] font-normal text-emerald-800">
                Audit Timestamp: {formattedDate}
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-mono">
              GROW: {actions.GROW} | MAINTAIN: {actions.MAINTAIN} | SWAP:{" "}
              {actions.SWAP} | REDUCE: {actions.REDUCE} (Total {totalSKUs} SKUs)
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              onClick={handleDownloadLog}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition flex items-center gap-1.5"
              data-testid="download-audit-button"
            >
              <FileText className="w-3.5 h-3.5" />
              Download Audit Log JSON
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-bold text-[#1E2229] bg-[#FFC20E] hover:bg-[#f0b506] rounded transition shadow-sm"
              data-testid="return-to-canvas-button"
            >
              Return to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineConfirmationModal;
