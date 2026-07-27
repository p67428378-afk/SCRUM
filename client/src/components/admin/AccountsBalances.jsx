import React from "react";
import { Wallet, PiggyBank, Landmark } from "lucide-react";
import Badge from "../common/Badge";

export default function AccountsBalances({ accounts }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "checking":
        return <Wallet size={18} />;
      case "savings":
        return <PiggyBank size={18} />;
      default:
        return <Landmark size={18} />;
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
    <div className="glass-card rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-on-surface border-b border-slate-border pb-4">
        Accounts & Balances
      </h3>

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">
            No accounts found for this user.
          </p>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3 bg-surface-variant/20 rounded-lg border border-slate-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center">
                  {getIcon(acc.account_type)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {acc.account_type}
                  </p>
                  <p className="text-xs text-outline">
                    {acc.account_number_masked}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">
                  {formatBalance(acc.balance)}
                </p>
                <Badge
                  variant={acc.status === "active" ? "success" : "warning"}
                >
                  {acc.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
