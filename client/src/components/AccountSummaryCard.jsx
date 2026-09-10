import React from "react";
import { Wallet, ShieldCheck, User } from "lucide-react";

export default function AccountSummaryCard({
  account,
  accounts = [],
  onSelectAccount,
}) {
  const defaultAccountId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const defaultBalance = 15420.5;
  const defaultName = "Primary Checking Account";

  const activeAccount = account || {
    id: defaultAccountId,
    user_name: defaultName,
    balance: defaultBalance,
  };

  const formattedBalance =
    typeof activeAccount.balance === "number"
      ? activeAccount.balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : activeAccount.balance;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          Sender Account Details
        </h3>
        <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Active
        </span>
      </div>

      <div>
        <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
          Available Balance
        </span>
        <p className="text-3xl font-extrabold text-white mt-1">
          ${formattedBalance}{" "}
          <span className="text-xs text-slate-400 font-normal">USD</span>
        </p>
      </div>

      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/60 font-mono text-xs space-y-1">
        <div className="flex justify-between text-slate-400">
          <span>Account Name:</span>
          <span className="text-slate-200 font-sans font-medium">
            {activeAccount.user_name || "Primary User"}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Account UUID:</span>
          <span
            className="text-emerald-400 truncate max-w-[200px]"
            title={activeAccount.id}
          >
            {activeAccount.id}
          </span>
        </div>
      </div>

      {accounts.length > 1 && (
        <div className="pt-2 border-t border-slate-700/60">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Switch Sender Account
          </label>
          <select
            value={activeAccount.id}
            onChange={(e) => {
              const selected = accounts.find((a) => a.id === e.target.value);
              if (selected && onSelectAccount) onSelectAccount(selected);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.user_name} (${acc.balance?.toFixed(2)}) -{" "}
                {acc.id.substring(0, 8)}...
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
