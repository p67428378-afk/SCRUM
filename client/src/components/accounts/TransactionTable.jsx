import React from "react";
import Badge from "../common/Badge";

export default function TransactionTable({ transactions, loading }) {
  const formatAmount = (amount) => {
    const val = parseFloat(amount);
    if (isNaN(val)) return "$0.00";
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(val));
    return val > 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-border bg-surface-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Reference ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-border/50 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No transactions found matching the filters.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isCredit = parseFloat(tx.amount) > 0;
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-surface-variant/10 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-on-surface">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {tx.category}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-outline">
                      {tx.reference_id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          tx.status === "completed" ? "success" : "warning"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                        isCredit ? "text-emerald" : "text-on-surface"
                      }`}
                    >
                      {formatAmount(tx.amount)}
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
