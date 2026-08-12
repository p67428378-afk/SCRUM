import React, { useState } from "react";
import {
  Play,
  Loader2,
  FileText,
  Upload,
  CreditCard,
  Database,
  Sparkles,
} from "lucide-react";

export default function InitiateTaskForm({
  onInitiate,
  isSubmitting,
  disabled,
}) {
  const [actionType, setActionType] = useState("report_generation");
  const [reportType, setReportType] = useState("quarterly_summary");
  const [fileSize, setFileSize] = useState("25");
  const [amount, setAmount] = useState("1500");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting || disabled) return;

    let parameters = {};
    if (actionType === "report_generation") {
      parameters = { report_type: reportType, year: 2026 };
    } else if (actionType === "file_upload") {
      parameters = {
        file_name: "financial_audit_q1.xlsx",
        size_mb: parseInt(fileSize),
      };
    } else if (actionType === "payment_processing") {
      parameters = { amount: parseFloat(amount), currency: "USD" };
    } else if (actionType === "data_sync") {
      parameters = { target_warehouse: "snowflake_prod", records: 50000 };
    }

    onInitiate(actionType, parameters);
  };

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-2 mb-4">
        <Sparkles class="w-5 h-5 text-blue-600" />
        <h2 class="text-lg font-bold text-gray-900">Submit New Task</h2>
      </div>
      <p class="text-xs text-gray-500 mb-6">
        Initiate an asynchronous long-running action with immediate optimistic
        processing state (t=0ms).
      </p>

      <form onSubmit={handleSubmit} class="space-y-5">
        {/* Action Type Selection */}
        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Action Type
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: "report_generation",
                label: "Report Generation",
                icon: FileText,
              },
              { id: "file_upload", label: "File Upload", icon: Upload },
              {
                id: "payment_processing",
                label: "Payment Processing",
                icon: CreditCard,
              },
              { id: "data_sync", label: "Data Sync", icon: Database },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActionType(id)}
                disabled={isSubmitting || disabled}
                class={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition ${
                  actionType === id
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon
                  class={`w-5 h-5 mb-1.5 ${actionType === id ? "text-blue-600" : "text-gray-400"}`}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Inputs */}
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {actionType === "report_generation" && (
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Report Category
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                disabled={isSubmitting || disabled}
                class="w-full text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quarterly_summary">
                  Quarterly Summary (Fast - 5s)
                </option>
                <option value="annual_compliance">
                  Annual Compliance Audit (Standard - 15s)
                </option>
                <option value="heavy_analytics">
                  Data Warehouse Analytics (Slow - 35s, triggers Escalation
                  Alert)
                </option>
                <option value="invalid_request">
                  Simulate Failure (Triggers PAY_402 / RPT_FAIL)
                </option>
              </select>
            </div>
          )}

          {actionType === "file_upload" && (
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Estimated File Size (MB)
              </label>
              <input
                type="number"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                disabled={isSubmitting || disabled}
                class="w-full text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {actionType === "payment_processing" && (
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                Payment Amount ($ USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting || disabled}
                class="w-full text-sm bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {actionType === "data_sync" && (
            <div class="text-xs text-gray-600">
              Target Warehouse:{" "}
              <span class="font-mono bg-gray-200 px-1 rounded">
                snowflake_prod
              </span>{" "}
              (50,000 records)
            </div>
          )}
        </div>

        {/* Submit Button with Instant Optimistic Lock at t=0ms */}
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          class={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center space-x-2 ${
            isSubmitting
              ? "bg-amber-600 cursor-not-allowed shadow-inner"
              : disabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 class="w-4 h-4 animate-spin text-white" />
              <span>Processing request... (t = 0ms)</span>
            </>
          ) : (
            <>
              <Play class="w-4 h-4 fill-current" />
              <span>
                Trigger {actionType.replace("_", " ").toUpperCase()} Action
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
