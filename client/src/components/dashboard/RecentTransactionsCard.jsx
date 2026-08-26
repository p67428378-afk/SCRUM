import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Receipt,
  CreditCard,
  Calendar,
} from "lucide-react";

export default function RecentTransactionsCard({
  transactions,
  categories,
  loading,
  onAddIncome,
  onAddExpense,
}) {
  const categoryMap = (categories || []).reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const formatCurrency = (amount, type) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return type === "income" ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const recentList = (transactions || []).slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#17A34A] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171C29]">
                Recent Transactions
              </h3>
              <p className="text-xs text-[#707A8C]">Latest recorded activity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddIncome}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#17A34A] hover:bg-emerald-100 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
            <button
              onClick={onAddExpense}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-[#DB2626] hover:bg-red-100 text-xs font-semibold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {recentList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-[#707A8C]">
            <Receipt className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-[#171C29]">
              No recent transactions
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Start tracking your budget by clicking Add Income or Add Expense
              above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentList.map((tx) => {
              const isIncome = tx.type === "income";
              const catName = categoryMap[tx.category_id] || "General";

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between hover:bg-gray-50/70 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? "bg-emerald-50 text-[#17A34A]"
                          : "bg-red-50 text-[#DB2626]"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-sm font-semibold text-[#171C29] truncate">
                        {tx.description}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#707A8C] mt-0.5">
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded">
                          {catName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formatDate(tx.date)}
                        </span>
                        {tx.payment_method && (
                          <span className="hidden sm:flex items-center gap-1 text-[11px]">
                            <CreditCard className="w-3 h-3 text-gray-400" />
                            {tx.payment_method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <span
                      className={`text-sm font-bold block ${
                        isIncome ? "text-[#17A34A]" : "text-[#DB2626]"
                      }`}
                    >
                      {formatCurrency(tx.amount, tx.type)}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-[#707A8C]">
                      {tx.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-[#707A8C]">Showing recent activity</span>
        <Link
          to="/transactions"
          className="font-semibold text-[#2663EB] hover:text-blue-700 hover:underline"
        >
          View All Transactions &rarr;
        </Link>
      </div>
    </div>
  );
}

RecentTransactionsCard.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category_id: PropTypes.string.isRequired,
      payment_method: PropTypes.string,
    }),
  ),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
  loading: PropTypes.bool,
  onAddIncome: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func.isRequired,
};

RecentTransactionsCard.defaultProps = {
  transactions: [],
  categories: [],
  loading: false,
};
