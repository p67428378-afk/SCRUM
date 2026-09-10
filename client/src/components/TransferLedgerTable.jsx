import React, { useState } from "react";
import { History, Download, Search, RefreshCw } from "lucide-react";

export default function TransferLedgerTable({
  transfers = [],
  loading,
  onRefresh,
  onViewReceipt,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransfers = transfers.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.id && item.id.toLowerCase().includes(term)) ||
      (item.sender_id && item.sender_id.toLowerCase().includes(term)) ||
      (item.receiver_id && item.receiver_id.toLowerCase().includes(term)) ||
      (item.status && item.status.toLowerCase().includes(term))
    );
  });

  const exportCSV = () => {
    if (!transfers.length) return;
    const headers = [
      "Timestamp",
      "Ref UUID",
      "Sender UUID",
      "Recipient UUID",
      "Amount",
      "Status",
    ];
    const rows = transfers.map((t) => [
      t.created_at || "",
      t.id || "",
      t.sender_id || "",
      t.receiver_id || "",
      t.amount || 0,
      t.status || "COMPLETED",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `p2p_transfer_ledger_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            P2P Transfer Ledger & Audit Log
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit log of all completed and blocked transfers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs flex items-center gap-1 transition-colors"
              title="Refresh transfers"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          )}
          <button
            onClick={exportCSV}
            disabled={!transfers.length}
            className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by Ref UUID, Sender ID, or Recipient ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>

      <div className="overflow-x-auto border border-slate-700/80 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-700">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Ref UUID</th>
              <th className="p-3">Sender UUID</th>
              <th className="p-3">Recipient UUID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-6 text-center text-slate-400 font-mono"
                >
                  Loading transfer ledger...
                </td>
              </tr>
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="p-6 text-center text-slate-500 font-mono"
                >
                  No transfer records found.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((item) => {
                const isBlocked =
                  item.status === "BLOCKED" ||
                  (item.status && item.status.startsWith("BLOCKED"));
                const formattedAmt =
                  typeof item.amount === "number"
                    ? item.amount.toFixed(2)
                    : item.amount;
                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "N/A";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td
                      className="p-3 font-mono text-emerald-400 font-medium truncate max-w-[120px]"
                      title={item.id}
                    >
                      {item.id ? `${item.id.substring(0, 8)}...` : "N/A"}
                    </td>
                    <td
                      className="p-3 font-mono text-slate-300 truncate max-w-[120px]"
                      title={item.sender_id}
                    >
                      {item.sender_id
                        ? `${item.sender_id.substring(0, 8)}...`
                        : "N/A"}
                    </td>
                    <td
                      className="p-3 font-mono text-slate-300 truncate max-w-[120px]"
                      title={item.receiver_id}
                    >
                      {item.receiver_id
                        ? `${item.receiver_id.substring(0, 8)}...`
                        : "N/A"}
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      ${formattedAmt}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {isBlocked ? (
                        <span className="bg-rose-950 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-semibold text-[10px]">
                          BLOCKED
                        </span>
                      ) : (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {item.status || "COMPLETED"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => onViewReceipt && onViewReceipt(item)}
                        className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium text-xs"
                      >
                        Receipt
                      </button>
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
}
