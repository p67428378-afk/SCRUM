import React from "react";
import { XCircle, AlertCircle, RotateCcw, HelpCircle, Bug } from "lucide-react";

export default function FailedStateShowcase({ error, taskId, onRetry }) {
  if (!error) return null;

  const errorCode = error.code || "TASK_EXECUTION_FAILED";
  const errorReason =
    error.reason || "Operation failed during background execution pipeline.";

  return (
    <div class="bg-red-50 border-2 border-red-300 rounded-xl p-6 shadow-sm space-y-4">
      <div class="flex items-start space-x-3">
        <div class="p-2 bg-red-100 rounded-lg text-red-600 mt-0.5">
          <XCircle class="w-6 h-6" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-red-900">
              Task Processing Failed
            </h3>
            <span class="text-xs font-mono font-bold bg-red-200 text-red-800 px-2.5 py-1 rounded">
              Error Code: {errorCode}
            </span>
          </div>
          <p class="text-xs text-red-700 mt-1">
            Task ID: <span class="font-mono">{taskId || "N/A"}</span>
          </p>
        </div>
      </div>

      {/* Specific Error Reason Display */}
      <div class="bg-white p-4 rounded-lg border border-red-200 space-y-2">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-1">
          <Bug class="w-3.5 h-3.5 text-red-500" />
          <span>Detailed Diagnostic Reason</span>
        </div>
        <div class="text-sm font-semibold text-red-900 leading-snug">
          "{errorReason}"
        </div>
      </div>

      {/* Actions */}
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center space-x-1 text-xs text-red-600">
          <HelpCircle class="w-4 h-4" />
          <span>
            Provide Error Code <code class="font-bold">{errorCode}</code> if
            contacting support.
          </span>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            class="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-bold transition shadow"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Retry Operation</span>
          </button>
        )}
      </div>
    </div>
  );
}
