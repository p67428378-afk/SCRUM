import React from "react";
import { Link } from "react-router-dom";
import {
  Coffee,
  Landmark,
  ShoppingBag,
  ArrowLeftRight,
  Car,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

export default function RecentActivity({ transactions }) {
  const getIcon = (description, amount) => {
    const desc = description?.toLowerCase() || "";
    const isCredit = parseFloat(amount) > 0;

    if (desc.includes("starbucks") || desc.includes("coffee")) {
      return <Coffee size={20} />;
    }
    if (desc.includes("salary") || desc.includes("deposit") || isCredit) {
      return <ArrowUpRight className="text-emerald" size={20} />;
    }
    if (
      desc.includes("whole foods") ||
      desc.includes("grocery") ||
      desc.includes("market")
    ) {
      return <ShoppingBag size={20} />;
    }
    if (desc.includes("transfer")) {
      return <ArrowLeftRight className="text-brand-indigo" size={20} />;
    }
    if (
      desc.includes("shell") ||
      desc.includes("gas") ||
      desc.includes("car")
    ) {
      return <Car size={20} />;
    }
    return <ArrowDownLeft size={20} />;
  };

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
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-on-surface">Recent Activity</h2>
        <Link
          to="/accounts"
          className="text-xs font-semibold text-brand-indigo hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[350px]">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-sm">
            No recent transactions found.
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const isCredit = parseFloat(tx.amount) > 0;
            return (
              <div
                key={tx.id}
                className="flex justify-between items-center p-2 hover:bg-surface-variant/30 rounded-lg transition-colors border-b border-slate-border/50 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCredit
                        ? "bg-brand-emerald/10 text-emerald"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {getIcon(tx.description, tx.amount)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">
                      {tx.description}
                    </div>
                    <div className="text-xs text-outline">
                      {formatDate(tx.date)} • {tx.category}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold ${isCredit ? "text-emerald" : "text-on-surface"}`}
                >
                  {formatAmount(tx.amount)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
