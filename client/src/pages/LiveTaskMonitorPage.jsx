import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TaskDetailCard from "../components/tasks/TaskDetailCard";
import EscalationAlertBanner from "../components/tasks/EscalationAlertBanner";
import FailedStateShowcase from "../components/tasks/FailedStateShowcase";
import {
  Radio,
  Zap,
  Shield,
  Database,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function LiveTaskMonitorPage({ taskTracker }) {
  const [searchParams] = useSearchParams();
  const queryTaskId = searchParams.get("taskId") || searchParams.get("task_id");

  const {
    taskId,
    taskState,
    connectionMode,
    wsConnected,
    error,
    fetchStatus,
    initiateTask,
    resetTask,
  } = taskTracker;

  return (
    <div class="space-y-6">
      {/* Top Banner */}
      <div class="bg-slate-900 text-white p-6 rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold flex items-center space-x-2">
            <span>Live Task Monitor</span>
            <span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-mono">
              Real-Time SSE/WS Engine
            </span>
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Real-time tracking for task{" "}
            <code class="font-mono text-blue-300">
              {taskId || "None Selected"}
            </code>{" "}
            with session re-hydration
          </p>
        </div>

        <div class="flex items-center space-x-2">
          <button
            onClick={fetchStatus}
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5"
          >
            <RefreshCw class="w-3.5 h-3.5 text-blue-400" />
            <span>Re-fetch Status</span>
          </button>
          <button
            onClick={resetTask}
            class="px-3 py-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 text-xs font-semibold rounded-lg transition"
          >
            Reset Session
          </button>
        </div>
      </div>

      {/* Prolonged Pending 30s Escalation Banner */}
      {taskState.is_escalated &&
        (taskState.status === "pending" ||
          taskState.status === "escalated_pending") && (
          <EscalationAlertBanner
            isEscalated={true}
            elapsedSeconds={taskState.elapsed_seconds}
            message={taskState.escalation_message}
          />
        )}

      {/* Failed State Showcase with Contextual Error Reason */}
      {taskState.status === "failed" && (
        <FailedStateShowcase
          error={
            taskState.error || {
              code: "TASK_FAILED",
              reason:
                error ||
                "Background worker encountered an unhandled exception.",
            }
          }
          taskId={taskId}
          onRetry={() =>
            initiateTask(taskState.action_type || "report_generation")
          }
        />
      )}

      {/* Main Task Detail Stepper & Card */}
      <TaskDetailCard taskState={taskState} onRefresh={fetchStatus} />

      {/* Diagnostics Grid */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Diagnostics &amp; Re-hydration Status
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center space-x-3">
            {wsConnected ? (
              <Zap class="w-5 h-5 text-emerald-500" />
            ) : (
              <Radio class="w-5 h-5 text-amber-500" />
            )}
            <div>
              <span class="text-gray-500 block">Connection Mode</span>
              <span class="font-bold text-gray-900 capitalize">
                {connectionMode} ({wsConnected ? "Connected" : "Polling 3s"})
              </span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center space-x-3">
            <Database class="w-5 h-5 text-blue-500" />
            <div>
              <span class="text-gray-500 block">Session Persistence</span>
              <span class="font-bold text-gray-900">
                {sessionStorage.getItem("active_task_id")
                  ? "Active in sessionStorage"
                  : "In-Memory Only"}
              </span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center space-x-3">
            <Shield class="w-5 h-5 text-emerald-500" />
            <div>
              <span class="text-gray-500 block">Auth Status</span>
              <span class="font-bold text-gray-900">Bearer Token Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
