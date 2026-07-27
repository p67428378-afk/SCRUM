import React from "react";
import Badge from "../common/Badge";

export default function AuditLogsTable({ logs, loading }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getBadgeVariant = (type) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("failed") || t.includes("error")) return "error";
    if (t.includes("success") || t.includes("completed")) return "success";
    if (t.includes("sent") || t.includes("initiated")) return "info";
    return "warning";
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-border bg-surface-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Event Type</th>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">IP Address</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-border/50 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-surface-variant/10 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getBadgeVariant(log.event_type)}>
                      {log.event_type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-outline">
                    {log.user_id || "System"}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {log.ip_address}
                  </td>
                  <td
                    className="px-6 py-4 text-on-surface max-w-xs truncate"
                    title={JSON.stringify(log.details)}
                  >
                    {JSON.stringify(log.details)}
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
