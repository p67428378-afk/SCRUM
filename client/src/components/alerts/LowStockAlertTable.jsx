import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Filter } from "lucide-react";

const LowStockAlertTable = ({
  alerts = [],
  loading = false,
  onResolveAlert,
}) => {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter === "ALL") return true;
    return alert.status === statusFilter;
  });

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Low Stock Alert Center
          </h3>
          <p className="text-xs text-slate-400">
            Automated notifications triggered when warehouse stock falls below
            reorder thresholds
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-800 text-slate-200">
              All Alert Statuses
            </option>
            <option value="ACTIVE" className="bg-slate-800 text-slate-200">
              ACTIVE
            </option>
            <option
              value="ACKNOWLEDGED"
              className="bg-slate-800 text-slate-200"
            >
              ACKNOWLEDGED
            </option>
            <option value="RESOLVED" className="bg-slate-800 text-slate-200">
              RESOLVED
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold">Warehouse</th>
              <th className="px-4 py-3 font-semibold text-right">
                Current Qty
              </th>
              <th className="px-4 py-3 font-semibold text-right">
                Reorder Threshold
              </th>
              <th className="px-4 py-3 font-semibold text-center">Deficit</th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  Loading active alerts...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  No stock alerts found for current filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert, index) => {
                const deficit =
                  alert.reorder_threshold - alert.current_quantity;
                return (
                  <tr
                    key={alert.id || index}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      {alert.sku || "SKU-9901"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {alert.warehouse_name || "Warehouse A (Central)"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-400">
                      {alert.current_quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {alert.reorder_threshold}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                        -{deficit > 0 ? deficit : 0} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {alert.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                      {alert.status === "ACKNOWLEDGED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ACKNOWLEDGED
                        </span>
                      )}
                      {alert.status === "RESOLVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> RESOLVED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {alert.status !== "RESOLVED" && (
                        <button
                          onClick={() =>
                            onResolveAlert && onResolveAlert(alert)
                          }
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded border border-emerald-500/30 text-xs font-medium transition-colors"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockAlertTable;
