import React, { useState, useEffect } from "react";
import api from "../../services/api";

export const AuditLogTable = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [limit, setLimit] = useState(20);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [actorFilter, eventTypeFilter, limit, skip]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        limit,
        skip,
      };
      if (actorFilter) params.actor = actorFilter;
      if (eventTypeFilter) params.event_type = eventTypeFilter;

      const response = await api.get("/api/v1/admin/audit-logs", { params });
      setLogs(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      setError("Failed to load audit logs. Admin access required.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Immutable Audit Logs</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Filter by Actor"
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Filter by Event Type"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error ? (
        <div className="p-6 text-red-400 text-sm text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-slate-400 text-sm"
                  >
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-slate-400 text-sm"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                      {log.event_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono whitespace-nowrap">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          log.status === "success"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Showing {skip + 1} to {Math.min(skip + limit, total)} of {total}{" "}
          entries
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSkip(Math.max(0, skip - limit))}
            disabled={skip === 0 || loading}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={skip + limit >= total || loading}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogTable;
