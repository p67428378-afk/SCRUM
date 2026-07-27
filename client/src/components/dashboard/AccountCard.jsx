import React from "react";
import { Landmark, Wallet, PiggyBank } from "lucide-react";

export default function AccountCard({ account, onViewDetails, onTransfer }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "checking":
        return <Wallet className="text-brand-indigo" size={18} />;
      case "savings":
        return <PiggyBank className="text-brand-indigo" size={18} />;
      default:
        return <Landmark className="text-brand-indigo" size={18} />;
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
    <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-semibold text-on-surface-variant">
              {account.account_type} Account
            </h3>
            <p className="text-xs text-outline">
              {account.account_number_masked}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-indigo/10 flex items-center justify-center">
            {getIcon(account.account_type)}
          </div>
        </div>
        <div className="text-3xl font-bold text-on-surface mb-2">
          {formatBalance(account.balance)}
        </div>
        <div className="flex items-center gap-1 text-emerald text-xs font-semibold mb-6">
          <span>Active Status</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onViewDetails}
          className="btn-outline rounded-lg py-2 text-xs font-semibold text-center transition-all"
        >
          View Details
        </button>
        <button
          onClick={onTransfer}
          className="bg-indigo-btn rounded-lg py-2 text-xs font-semibold text-center transition-all"
        >
          Transfer
        </button>
      </div>
    </div>
  );
}
