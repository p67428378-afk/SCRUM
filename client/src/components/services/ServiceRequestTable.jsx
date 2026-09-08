import React, { useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
} from "lucide-react";

export default function ServiceRequestTable({
  requests = [],
  staffMembers = [],
  onUpdateStatus,
  onAssignStaff,
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return (r.status || "").toUpperCase() === statusFilter.toUpperCase();
  });

  const getStatusBadge = (status) => {
    switch ((status || "").toUpperCase()) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
          </span>
        );
      case "IN PROGRESS":
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300 whitespace-nowrap">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Open
          </span>
        );
    }
  };

  const getCategoryColor = (category) => {
    switch ((category || "").toUpperCase()) {
      case "PLUMBING":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "ELECTRICAL":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Status Filter Tabs */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap justify-between items-center gap-3">
        <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-lg">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                statusFilter === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {status === "IN_PROGRESS" ? "In Progress" : status}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Total Tickets: {filteredRequests.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="p-3 whitespace-nowrap">Ticket ID</th>
              <th className="p-3">Title & Details</th>
              <th className="p-3 whitespace-nowrap">Category</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap">Assigned Staff</th>
              <th className="p-3 pr-6 text-right whitespace-nowrap">
                Update Workflow
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No service tickets found for status "{statusFilter}".
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3 font-mono text-[11px] text-slate-500 font-semibold whitespace-nowrap">
                    #{req.id?.slice(0, 8) || "TCK-101"}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{req.title}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {req.description}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryColor(req.category)}`}
                    >
                      {req.category}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {onAssignStaff ? (
                      <select
                        value={req.assigned_staff_id || ""}
                        onChange={(e) => onAssignStaff(req.id, e.target.value)}
                        className="p-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
                      >
                        <option value="">Unassigned</option>
                        {staffMembers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name || s.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        {req.assigned_staff_id
                          ? "Staff Assigned"
                          : "Unassigned"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 pr-6 text-right whitespace-nowrap">
                    {onUpdateStatus && (
                      <div className="flex justify-end gap-1">
                        {req.status !== "In Progress" &&
                          req.status !== "Resolved" && (
                            <button
                              onClick={() =>
                                onUpdateStatus(req.id, "In Progress")
                              }
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap"
                            >
                              Start
                            </button>
                          )}
                        {req.status !== "Resolved" && (
                          <button
                            onClick={() => onUpdateStatus(req.id, "Resolved")}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    )}
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
