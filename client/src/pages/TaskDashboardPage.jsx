import React, { useState, useEffect } from "react";
import InitiateTaskForm from "../components/tasks/InitiateTaskForm";
import LiveTaskBanner from "../components/tasks/LiveTaskBanner";
import TaskAuditTable from "../components/tasks/TaskAuditTable";
import { tasksAPI, authAPI } from "../services/api";
import { Activity, ShieldCheck, Lock, UserCheck } from "lucide-react";

export default function TaskDashboardPage({ taskTracker }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const { taskState, initiateTask, resetTask } = taskTracker;

  // Auto-login test account on load if not logged in
  useEffect(() => {
    const ensureAuth = async () => {
      try {
        await authAPI.getCurrentUser();
      } catch (err) {
        try {
          await authAPI.login("test@example.com", "testpassword");
        } catch (loginErr) {
          // If register needed
          try {
            await authAPI.register("test@example.com", "testpassword");
            await authAPI.login("test@example.com", "testpassword");
          } catch (e) {
            setAuthError(
              "Authentication failed. Please check backend connection.",
            );
          }
        }
      }
    };
    ensureAuth().then(() => fetchTasks());
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await tasksAPI.listTasks(0, 20);
      setTasks(data);
    } catch (e) {
      console.error("Failed to fetch task history", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiate = async (actionType, parameters) => {
    try {
      await initiateTask(actionType, parameters);
      fetchTasks();
    } catch (e) {
      console.error("Initiate failed", e);
    }
  };

  return (
    <div class="space-y-6">
      {/* Test Credentials Helper Banner */}
      <div class="bg-blue-950 text-blue-100 p-3 rounded-xl border border-blue-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div class="flex items-center space-x-2">
          <ShieldCheck class="w-4 h-4 text-emerald-400" />
          <span>
            Authenticated Test Account:{" "}
            <code class="font-mono bg-blue-900 px-1.5 py-0.5 rounded text-white font-semibold">
              test@example.com
            </code>{" "}
            /{" "}
            <code class="font-mono bg-blue-900 px-1.5 py-0.5 rounded text-white font-semibold">
              testpassword
            </code>
          </span>
        </div>
        <span class="text-[11px] text-blue-300">
          FastAPI Bearer Token Auto-Managed
        </span>
      </div>

      {/* Active Task Banner */}
      <LiveTaskBanner taskState={taskState} onReset={resetTask} />

      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Trigger Form */}
        <div class="lg:col-span-1">
          <InitiateTaskForm
            onInitiate={handleInitiate}
            isSubmitting={taskState.status === "submitting"}
          />
        </div>

        {/* Audit Table Summary */}
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900">
              Recent Task Executions
            </h3>
            <button
              onClick={fetchTasks}
              class="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Refresh Table
            </button>
          </div>
          <TaskAuditTable
            tasks={tasks}
            isLoading={isLoading}
            onRefresh={fetchTasks}
          />
        </div>
      </div>
    </div>
  );
}
