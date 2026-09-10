import React from "react";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";

export default function AccountSummaryCard({
  account,
  currentBalance = 12500.0,
}) {
  const displayBalance =
    account?.balance !== undefined
      ? parseFloat(account.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : currentBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Primary Account
          </span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {account?.account_name || "Premier Checking (•••• 8492)"}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Zap className="w-3 h-3 text-emerald-600" />
          Zero Fee P2P
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500">Available Balance</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1">
          ${displayBalance}{" "}
          <span className="text-sm font-semibold text-slate-500">USD</span>
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>FDIC Insured &bull; 256-bit Encrypted</span>
        </div>
        <span>Daily Limit: $10,000.00</span>
      </div>
    </div>
  );
}
