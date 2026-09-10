import PropTypes from "prop-types";
import {
  History,
  RefreshCw,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function RecentTransfersTable({
  transfers,
  isLoading,
  onRefresh,
}) {
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val || 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            Recent P2P Transfers
          </h2>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-medium"
            title="Refresh transactions"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
            />
            Refresh
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        {isLoading && transfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-sm">Loading transactions...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No transfers recorded yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Initiate a transfer to see real-time updates
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-2">Recipient</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 pl-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {transfers.map((tx) => {
                const isCompleted = tx.status === "COMPLETED";
                const isBlocked = tx.status === "BLOCKED";

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span
                          className="truncate max-w-[120px] sm:max-w-[160px] text-slate-800 font-medium"
                          title={tx.receiver_id}
                        >
                          {tx.receiver_id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900 font-sans">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isBlocked
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-2.5 h-2.5" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 pl-2 text-right text-slate-500 font-sans text-[11px]">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

RecentTransfersTable.propTypes = {
  transfers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      sender_id: PropTypes.string.isRequired,
      receiver_id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      created_at: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  onRefresh: PropTypes.func,
};

RecentTransfersTable.defaultProps = {
  isLoading: false,
  onRefresh: null,
};
