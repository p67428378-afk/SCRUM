import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function LiveTaskBanner({ taskState, onReset }) {
  if (!taskState || taskState.status === "idle") {
    return null;
  }

  const { task_id, status, action_type, elapsed_seconds, is_escalated, error } =
    taskState;

  const getStatusBadge = () => {
    switch (status) {
      case "submitting":
        return (
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
            <Loader2 class="w-3.5 h-3.5 mr-1 animate-spin text-blue-600" />
            Optimistic Submitting...
          </span>
        );
      case "pending":
        return (
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Loader2 class="w-3.5 h-3.5 mr-1 animate-spin text-amber-600" />
            Pending Processing
          </span>
        );
      case "escalated_pending":
        return (
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white animate-pulse">
            <AlertTriangle class="w-3.5 h-3.5 mr-1" />
            Prolonged Pending (&gt;30s)
          </span>
        );
      case "success":
        return (
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 class="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Completed Successfully
          </span>
        );
      case "failed":
        return (
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle class="w-3.5 h-3.5 mr-1 text-red-600" />
            Task Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      class={`rounded-xl shadow-sm border p-4 transition-all ${
        status === "failed"
          ? "bg-red-50 border-red-200"
          : status === "success"
            ? "bg-emerald-50 border-emerald-200"
            : is_escalated
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20"
              : "bg-blue-50 border-blue-200"
      }`}
    >
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Status Info */}
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
            <Clock
              class={`w-5 h-5 ${status === "failed" ? "text-red-500" : status === "success" ? "text-emerald-500" : "text-blue-500 animate-spin"}`}
            />
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {action_type?.replace("_", " ")}
              </span>
              {getStatusBadge()}
            </div>
            <div class="text-xs text-gray-600 mt-1 font-mono">
              ID:{" "}
              {task_id
                ? `${task_id.substring(0, 18)}...`
                : "Pending ID assignment"}
            </div>
          </div>
        </div>

        {/* Right Timer & Actions */}
        <div class="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div class="text-right">
            <div class="text-xs text-gray-500 font-medium">
              Elapsed Duration
            </div>
            <div class="text-lg font-mono font-bold text-gray-900">
              {elapsed_seconds}s
            </div>
          </div>

          {task_id && (
            <Link
              to={`/tasks/monitor?taskId=${task_id}`}
              class="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg transition"
            >
              <span>Inspect Live</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </Link>
          )}

          {(status === "success" || status === "failed") && (
            <button
              onClick={onReset}
              class="text-xs font-medium text-gray-600 hover:text-gray-900 underline"
            >
              Clear Banner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
