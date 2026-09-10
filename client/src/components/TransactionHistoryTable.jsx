import React from "react";
import { History, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

const TransactionHistoryTable = ({
  transfers = [],
  currentUserId = "usr_12345",
  isLoading,
}) => {
  return (
    <div className="bg-[#0f1b3d] border border-slate-700/60 rounded-xl p-6 shadow-xl mt-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-sky-400" />
          Recent P2P Transfers
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          Showing {transfers.length} records
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
          Loading transaction ledger...
        </div>
      ) : transfers.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-900/40 rounded-lg border border-slate-800/80">
          No transfers recorded yet. Send funds above to populate ledger.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Transaction UUID</th>
                <th className="py-3 px-3">Counterparty</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {transfers.map((tx) => {
                const isOutgoing = tx.sender_id === currentUserId;
                const counterparty = isOutgoing ? tx.receiver_id : tx.sender_id;
                const formattedDate = tx.created_at
                  ? new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now";

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      {isOutgoing ? (
                        <span className="inline-flex items-center text-amber-400 font-sans font-medium text-xs">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Outgoing
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-emerald-400 font-sans font-medium text-xs">
                          <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />{" "}
                          Incoming
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 px-3 text-slate-300 truncate max-w-[140px]"
                      title={tx.id}
                    >
                      {tx.id}
                    </td>
                    <td className="py-3 px-3 text-sky-300 font-semibold">
                      {counterparty}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold text-sm ${isOutgoing ? "text-slate-200" : "text-emerald-400"}`}
                    >
                      {isOutgoing ? "-" : "+"}$
                      {typeof tx.amount === "number"
                        ? tx.amount.toFixed(2)
                        : tx.amount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-sans uppercase font-bold tracking-wide">
                        {tx.status || "COMPLETED"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryTable;
