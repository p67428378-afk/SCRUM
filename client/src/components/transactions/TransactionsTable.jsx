import React from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

export default function TransactionsTable({
  transactions,
  categories,
  loading,
  onEdit,
  onDelete,
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center text-[#707A8C]">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-[#171C29]">
          No Transactions Found
        </h4>
        <p className="text-sm text-[#707A8C] mt-1 max-w-sm">
          No records matched your search or filters. Try adjusting your filters
          or record a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#171C29]">
          <thead className="bg-gray-50/80 text-xs font-semibold text-[#707A8C] uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Date
              </th>
              <th scope="col" className="px-6 py-3.5">
                Description
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5">
                Payment Method
              </th>
              <th scope="col" className="px-6 py-3.5">
                Type
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Amount
              </th>
              <th scope="col" className="px-6 py-3.5 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              const catName = categoryMap[tx.category_id] || "General";

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#707A8C]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#171C29] max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-[#171C29]">
                      {catName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-[#707A8C]">
                    {tx.payment_method ? (
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span>{tx.payment_method}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        isIncome
                          ? "bg-emerald-50 text-[#17A34A]"
                          : "bg-red-50 text-[#DB2626]"
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${
                      isIncome ? "text-[#17A34A]" : "text-[#DB2626]"
                    }`}
                  >
                    {formatCurrency(tx.amount, tx.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        title="Edit Transaction"
                        aria-label={`Edit ${tx.description}`}
                        className="p-1.5 rounded-lg text-[#707A8C] hover:text-[#2663EB] hover:bg-blue-50 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        title="Delete Transaction"
                        aria-label={`Delete ${tx.description}`}
                        className="p-1.5 rounded-lg text-[#707A8C] hover:text-[#DB2626] hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-[#707A8C]">
        <span>Total transactions: {transactions.length}</span>
      </div>
    </div>
  );
}

TransactionsTable.propTypes = {
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
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

TransactionsTable.defaultProps = {
  loading: false,
};
