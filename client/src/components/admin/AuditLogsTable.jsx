import React from "react";
import { ShieldCheck, History } from "lucide-react";

export default function AuditLogsTable({ auditLogs = [] }) {
  const formatDateTime = (dtStr) => {
    if (!dtStr) return "N/A";
    try {
      return (
        new Date(dtStr).toISOString().replace("T", " ").substring(0, 19) +
        " UTC"
      );
    } catch {
      return dtStr;
    }
  };

  const formatJsonVal = (val) => {
    if (!val) return "None";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-[14px] p-6 shadow-sm w-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8f0] mb-4">
        <h3 className="text-[#171c29] font-bold text-lg flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-[#2663eb]" />
          <span>Immutable Attendance Audit Trail</span>
        </h3>
        <span className="text-[#707a8c] text-xs font-medium bg-[#f7fafc] px-3 py-1 rounded-full border border-[#e3e8f0]">
          Verified Entries: {auditLogs.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e3e8f0]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7fafc] text-[#707a8c] font-semibold border-b border-[#e3e8f0] text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Audit ID</th>
              <th className="p-3.5">Timestamp (UTC)</th>
              <th className="p-3.5">Editor ID</th>
              <th className="p-3.5">Event ID</th>
              <th className="p-3.5">Previous State</th>
              <th className="p-3.5">New State</th>
              <th className="p-3.5">Justification Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e8f0]">
            {auditLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-[#707a8c]">
                  No audit log records found.
                </td>
              </tr>
            ) : (
              auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3.5 font-mono text-xs text-[#2663eb] font-medium">
                    {log.id ? log.id.substring(0, 8) : "N/A"}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-[#171c29]">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-[#707a8c]">
                    {log.editor_id ? log.editor_id.substring(0, 8) : "System"}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-[#707a8c]">
                    {log.event_id ? log.event_id.substring(0, 8) : "N/A"}
                  </td>
                  <td className="p-3.5 text-xs font-mono text-gray-600 max-w-xs truncate">
                    {formatJsonVal(log.old_value)}
                  </td>
                  <td className="p-3.5 text-xs font-mono text-gray-900 max-w-xs truncate">
                    {formatJsonVal(log.new_value)}
                  </td>
                  <td className="p-3.5 text-xs text-[#171c29] max-w-xs truncate">
                    {log.reason}
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
