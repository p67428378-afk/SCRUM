import React, { useState, useEffect } from "react";
import TaskAuditTable from "../components/tasks/TaskAuditTable";
import { tasksAPI } from "../services/api";
import { History, RefreshCw } from "lucide-react";

export default function TaskHistoryPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await tasksAPI.listTasks(0, 50);
      setTasks(data);
    } catch (e) {
      console.error("Failed to load task history", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <History class="w-6 h-6 text-blue-600" />
            <span>Task Execution History &amp; Audit Logs</span>
          </h2>
          <p class="text-xs text-gray-500 mt-1">
            Searchable history log across all task states (Pending, Success,
            Failed, Escalated) with CSV export capability.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          class="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1.5 text-gray-700"
        >
          <RefreshCw class="w-3.5 h-3.5 text-blue-600" />
          <span>Reload History</span>
        </button>
      </div>

      <TaskAuditTable
        tasks={tasks}
        isLoading={isLoading}
        onRefresh={fetchHistory}
      />
    </div>
  );
}
