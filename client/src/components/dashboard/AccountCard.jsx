import React from "react";

export const AccountCard = ({ account, onSelect }) => {
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <span className="material-symbols-outlined">payments</span>
        </span>
        <span className="text-xs font-medium text-slate-400">
          {account.account_number}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">
        {account.account_type}
      </h3>
      <div className="mb-4">
        <span className="text-2xl font-bold text-white block">
          {formatCurrency(account.balance, account.currency)}
        </span>
        <span className="text-xs text-slate-400">
          Available:{" "}
          {formatCurrency(account.available_balance, account.currency)}
        </span>
      </div>
      <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
        <span className="text-xs text-slate-400 capitalize">
          Status:{" "}
          <span
            className={
              account.status === "active"
                ? "text-emerald-400"
                : "text-amber-400"
            }
          >
            {account.status}
          </span>
        </span>
        <button
          onClick={() => onSelect(account)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
        >
          View Activity
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
