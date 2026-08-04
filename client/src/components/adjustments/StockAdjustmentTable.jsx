import React, { useState } from "react";
import {
  Plus,
  Clock,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const StockAdjustmentTable = ({
  adjustments = [],
  loading = false,
  onOpenModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = adjustments.filter((adj) => {
    const sku = adj.sku || adj.item_sku || "";
    const reason = adj.reason_code || "";
    const term = searchTerm.toLowerCase();
    return (
      sku.toLowerCase().includes(term) || reason.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            Stock Adjustment Audit Log
          </h3>
          <p className="text-xs text-slate-400">
            Timestamped record of all manual inventory modifications, transfers,
            and reconciliations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search adjustments..."
              className="bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => onOpenModal && onOpenModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Stock Adjustment
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/60 text-slate-400 border-b border-slate-700/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Item SKU</th>
              <th className="px-4 py-3 font-semibold text-right">Qty Change</th>
              <th className="px-4 py-3 font-semibold text-right">
                Prev &rarr; New
              </th>
              <th className="px-4 py-3 font-semibold">Reason Code</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Loading adjustment audit logs...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No adjustments recorded.
                </td>
              </tr>
            ) : (
              filtered.map((adj, index) => {
                const isPositive = adj.quantity_change > 0;
                return (
                  <tr
                    key={adj.adjustment_id || adj.id || index}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {adj.timestamp
                        ? new Date(adj.timestamp).toLocaleString()
                        : "Just now"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-400">
                      {adj.sku || adj.item_sku || "SKU-9901"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {isPositive
                          ? `+${adj.quantity_change}`
                          : adj.quantity_change}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono">
                      {adj.previous_quantity ?? "-"} &rarr;{" "}
                      {adj.new_quantity ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-900 border border-slate-700 text-slate-300">
                        {adj.reason_code || "MANUAL_ADJUSTMENT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">
                      {adj.notes || "N/A"}
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

export default StockAdjustmentTable;
