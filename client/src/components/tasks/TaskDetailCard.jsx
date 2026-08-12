import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCode,
  Check,
  RefreshCw,
} from "lucide-react";

export default function TaskDetailCard({ taskState, onRefresh }) {
  if (!taskState) return null;

  const {
    task_id,
    status,
    action_type,
    created_at,
    updated_at,
    elapsed_seconds,
    is_escalated,
    result,
    error,
  } = taskState;

  const steps = [
    {
      label: "Initiated (t=0ms)",
      done: status !== "submitting" && status !== "idle",
    },
    {
      label: "Processing (Pending)",
      done:
        status === "pending" ||
        status === "escalated_pending" ||
        status === "success" ||
        status === "failed",
    },
    {
      label: "30s Escalation Check",
      done: is_escalated || status === "success" || status === "failed",
      active:
        is_escalated &&
        (status === "pending" || status === "escalated_pending"),
    },
    {
      label: "Completion",
      done: status === "success" || status === "failed",
      failed: status === "failed",
    },
  ];

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 class="text-base font-bold text-gray-900 flex items-center space-x-2">
            <span>Task Execution Details</span>
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-normal">
              {action_type}
            </span>
          </h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">
            Task UUID: {task_id || "Generating..."}
          </p>
        </div>
        <button
          onClick={onRefresh}
          class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          title="Force Re-fetch Status"
        >
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>

      {/* Stepper Timeline */}
      <div>
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          State Machine Lifecycle
        </h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              class={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                step.failed
                  ? "border-red-300 bg-red-50 text-red-800"
                  : step.active
                    ? "border-amber-400 bg-amber-50 text-amber-900 font-semibold ring-2 ring-amber-400/20"
                    : step.done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-gray-50 text-gray-400"
              }`}
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold">Step {idx + 1}</span>
                {step.failed ? (
                  <XCircle class="w-4 h-4 text-red-500" />
                ) : step.done ? (
                  <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock class="w-4 h-4 text-gray-300" />
                )}
              </div>
              <span class="truncate">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata Grid */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
        <div>
          <span class="text-gray-500 block">Status Enum</span>
          <span class="font-bold font-mono text-gray-900 uppercase">
            {status}
          </span>
        </div>
        <div>
          <span class="text-gray-500 block">Elapsed Time</span>
          <span class="font-bold font-mono text-gray-900">
            {elapsed_seconds}s
          </span>
        </div>
        <div>
          <span class="text-gray-500 block">Created Timestamp</span>
          <span class="font-mono text-gray-800">
            {created_at ? new Date(created_at).toLocaleTimeString() : "N/A"}
          </span>
        </div>
        <div>
          <span class="text-gray-500 block">Last Updated</span>
          <span class="font-mono text-gray-800">
            {updated_at ? new Date(updated_at).toLocaleTimeString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Result Payload (if success) */}
      {status === "success" && result && (
        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
          <div class="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
            <span>Task Output Payload (200 OK)</span>
          </div>
          <pre class="bg-white p-3 rounded border border-emerald-100 text-xs font-mono text-gray-800 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
