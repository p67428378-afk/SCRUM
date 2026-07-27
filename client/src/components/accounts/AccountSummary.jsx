import React from "react";
import { Wallet, PiggyBank, Landmark } from "lucide-react";

export default function AccountSummary({
  accounts,
  activeAccount,
  onSelectAccount,
}) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "checking":
        return <Wallet size={20} />;
      case "savings":
        return <PiggyBank size={20} />;
      default:
        return <Landmark size={20} />;
    }
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return isNaN(num)
      ? "$0.00"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {accounts.map((acc) => {
        const isActive = activeAccount?.id === acc.id;
        return (
          <button
            key={acc.id}
            onClick={() => onSelectAccount(acc)}
            className={`text-left p-6 rounded-xl transition-all duration-200 border ${
              isActive
                ? "bg-brand-indigo/10 border-brand-indigo shadow-lg"
                : "glass-card border-slate-border hover:border-brand-indigo/50"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant">
                  {acc.account_type} Account
                </h3>
                <p className="text-xs text-outline">
                  {acc.account_number_masked}
                </p>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-brand-indigo/20 text-brand-indigo"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {getIcon(acc.account_type)}
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {formatBalance(acc.balance)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
