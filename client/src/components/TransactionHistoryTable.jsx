import PropTypes from "prop-types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function TransactionHistoryTable({
  transfers = [],
  isLoading = false,
  onRefresh,
  currentUserId = "usr_alexander",
}) {
  return (
    <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Recent Transfers History</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ledger of completed peer-to-peer settlements.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh History"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition disabled:opacity-50 flex items-center space-x-1 text-xs font-medium"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}
      </div>

      {isLoading && transfers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-xs font-medium">Loading ledger...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">No transfers yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Initiate your first peer-to-peer transfer above to see real-time
            settlements here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="w-full text-left text-sm"
            data-testid="transfers-table"
          >
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 rounded-l-xl">Type</th>
                <th className="py-3 px-3">Transfer ID</th>
                <th className="py-3 px-3">Counterparty</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((item) => {
                const isDebit =
                  item.sender_id === currentUserId ||
                  item.sender_id?.toLowerCase() ===
                    currentUserId?.toLowerCase() ||
                  item.sender_id?.includes("alexander");

                const formattedAmount = Number(item.amount).toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  },
                );

                const formattedDate = item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition duration-100 group"
                  >
                    <td className="py-3.5 px-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDebit
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-slate-300"
                        title={item.id}
                      >
                        {item.id ? `${item.id.substring(0, 8)}...` : "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-xs">
                          {isDebit
                            ? `To: ${item.receiver_id}`
                            : `From: ${item.sender_id}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {isDebit ? "Outgoing P2P" : "Incoming P2P"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`font-bold text-xs ${
                          isDebit ? "text-slate-900" : "text-emerald-600"
                        }`}
                      >
                        {isDebit
                          ? `-${formattedAmount}`
                          : `+${formattedAmount}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.status || "COMPLETED"}</span>
                      </span>
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
}

TransactionHistoryTable.propTypes = {
  transfers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sender_id: PropTypes.string.isRequired,
      receiver_id: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
      status: PropTypes.string,
      created_at: PropTypes.string,
    }),
  ),
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func,
  currentUserId: PropTypes.string,
};
