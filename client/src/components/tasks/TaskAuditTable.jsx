import React, { useState } from "react";
import {
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TaskAuditTable({ tasks = [], isLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.task_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.error?.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || task.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      "Task ID",
      "Action Type",
      "Status",
      "Created At",
      "Updated At",
      "Error Reason",
    ];
    const rows = filteredTasks.map((t) => [
      t.task_id,
      t.action_type,
      t.status,
      t.created_at,
      t.updated_at,
      t.error?.reason || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${val}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `task_audit_log_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "escalated_pending":
        return (
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock class="w-3 h-3 mr-1 text-amber-600 animate-spin" />
            Pending
          </span>
        );
      case "success":
        return (
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 class="w-3 h-3 mr-1 text-emerald-600" />
            Success
          </span>
        );
      case "failed":
        return (
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
            <XCircle class="w-3 h-3 mr-1 text-red-600" />
            Failed
          </span>
        );
      default:
        return <span class="text-xs text-gray-500">{status}</span>;
    }
  };

  return (
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Controls Bar */}
      <div class="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div class="relative w-full sm:w-64">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Task ID / Action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              class="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <div class="flex items-center space-x-1 border-l border-gray-200 pl-3">
            <Filter class="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All States</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={filteredTasks.length === 0}
          class="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-xs font-semibold text-gray-700 rounded-lg transition shadow-sm"
        >
          <Download class="w-3.5 h-3.5 text-gray-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table */}
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 uppercase tracking-wider">
            <tr>
              <th class="py-3 px-4">Task ID</th>
              <th class="py-3 px-4">Action Type</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Created At</th>
              <th class="py-3 px-4">Error Reason</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-gray-800">
            {isLoading ? (
              <tr>
                <td colSpan="6" class="py-8 text-center text-gray-500">
                  Loading task history...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" class="py-8 text-center text-gray-500">
                  No task audit records found.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.task_id} class="hover:bg-blue-50/50 transition">
                  <td class="py-3 px-4 font-mono font-medium text-blue-600">
                    {t.task_id}
                  </td>
                  <td class="py-3 px-4 font-medium capitalize">
                    {t.action_type?.replace("_", " ")}
                  </td>
                  <td class="py-3 px-4">{getStatusBadge(t.status)}</td>
                  <td class="py-3 px-4 font-mono text-gray-500">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td class="py-3 px-4 max-w-xs truncate text-red-600 font-medium">
                    {t.error?.reason || "-"}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <Link
                      to={`/tasks/monitor?taskId=${t.task_id}`}
                      class="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <span>Inspect</span>
                      <ExternalLink class="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
