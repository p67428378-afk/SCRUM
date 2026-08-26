import React from "react";
import PropTypes from "prop-types";
import { PieChart, AlertCircle } from "lucide-react";

const BAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-pink-500",
];

const BADGE_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "bg-cyan-50 text-cyan-700 border-cyan-200",
  "bg-pink-50 text-pink-700 border-pink-200",
];

export default function SpendingBreakdownCard({
  breakdown,
  totalExpense,
  loading,
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-4">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = breakdown || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2663EB] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171C29]">
                Spending Breakdown
              </h3>
              <p className="text-xs text-[#707A8C]">Distribution by Category</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#707A8C] bg-gray-100 px-2.5 py-1 rounded-full">
            Total: {formatCurrency(totalExpense || 0)}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-[#707A8C]">
            <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium">No expense records found</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Expenses added in this period will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {items.map((item, index) => {
              const colorClass = BAR_COLORS[index % BAR_COLORS.length];
              const badgeClass = BADGE_COLORS[index % BADGE_COLORS.length];
              const pct = item.percentage ?? 0;

              return (
                <div
                  key={item.category_id || item.category_name}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${badgeClass}`}
                    >
                      {item.category_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#171C29] font-semibold">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[#707A8C] w-12 text-right">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                      style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#707A8C]">
          <span>{items.length} categories tracked</span>
          <span className="font-medium text-[#171C29]">
            Largest: {items[0]?.category_name} (
            {items[0]?.percentage?.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );
}

SpendingBreakdownCard.propTypes = {
  breakdown: PropTypes.arrayOf(
    PropTypes.shape({
      category_id: PropTypes.string,
      category_name: PropTypes.string,
      amount: PropTypes.number,
      percentage: PropTypes.number,
    }),
  ),
  totalExpense: PropTypes.number,
  loading: PropTypes.bool,
};

SpendingBreakdownCard.defaultProps = {
  breakdown: [],
  totalExpense: 0,
  loading: false,
};
