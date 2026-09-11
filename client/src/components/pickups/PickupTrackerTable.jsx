import React, { useState, useEffect } from "react";
import { pickupsApi } from "../../services/api";
import {
  ListFilter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

export default function PickupTrackerTable({ refreshTrigger }) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPickups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pickupsApi.getPickups();
      setPickups(data || []);
    } catch (err) {
      console.error("Error fetching pickups:", err);
      // Fallback display if API fails
      setError("Could not connect to pickup service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [refreshTrigger]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case "confirmed":
      case "scheduled":
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" /> Confirmed
          </span>
        );
      case "skipped":
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Skipped
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
            {status || "Pending"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-blue-600" />
          Active Scheduled Appointments
        </h2>
        <button
          onClick={fetchPickups}
          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-xs text-slate-500">
          Loading scheduled appointments...
        </div>
      ) : pickups.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-md border border-dashed border-slate-200">
          No appointments found. Submit a request using the form.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-100 font-semibold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Address</th>
                <th className="p-2.5">Date & Slot</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pickups.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-mono font-semibold text-slate-900">
                    {p.tracking_code ||
                      (p.id ? p.id.substring(0, 8).toUpperCase() : "TRK-NEW")}
                  </td>
                  <td className="p-2.5 font-medium">{p.waste_type}</td>
                  <td
                    className="p-2.5 max-w-[150px] truncate"
                    title={p.address}
                  >
                    {p.address}
                  </td>
                  <td className="p-2.5 font-medium">
                    {p.scheduled_date} ({p.time_slot})
                  </td>
                  <td className="p-2.5">{getStatusBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
