import React from "react";
import { CheckCircle, AlertTriangle, XOctagon } from "lucide-react";

export default function StatusBanner({
  type,
  message,
  attemptedAmount,
  details,
  onAction,
}) {
  if (!message && type !== "success") return null;

  if (type === "success") {
    return (
      <div className="transfer-success-confirmation bg-slate-900 text-slate-100 p-6 rounded-xl border border-emerald-500/30 shadow-2xl my-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/40 text-2xl">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Transfer Completed Successfully!
          </h2>
          <p className="text-xs text-emerald-400 font-mono">
            STATUS: COMPLETED · HTTP 201 CREATED
          </p>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-lg mb-6 text-sm text-emerald-300">
          Funds transferred instantly via zero-latency P2P rail. Recipient
          ledger updated.
        </div>
        {details && (
          <div className="space-y-3 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 mb-6 font-mono text-xs">
            {details.id && (
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Transaction ID</span>
                <span className="text-slate-200 font-semibold truncate max-w-[200px]">
                  {details.id}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Sender ID</span>
              <span className="text-slate-200 truncate max-w-[200px]">
                {details.sender_id}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Receiver ID</span>
              <span className="text-slate-200 truncate max-w-[200px]">
                {details.receiver_id}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-700/40">
              <span className="text-slate-400">Transferred Amount</span>
              <span className="text-emerald-400 font-bold">
                ${parseFloat(details.amount).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        {onAction && (
          <button
            onClick={onAction}
            className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-md hover:bg-emerald-400 transition-colors"
          >
            Make Another Transfer
          </button>
        )}
      </div>
    );
  }

  const isFraud =
    message?.includes("Fraud threshold exceeded") ||
    message?.includes("Blocked");
  const isInsufficient = message?.includes("Insufficient funds");

  if (isFraud) {
    return (
      <div className="fraud-blocked-alert bg-slate-900 text-slate-100 p-6 rounded-xl border border-rose-500/40 shadow-2xl my-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-500/40 text-2xl">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Transfer Blocked
          </h2>
          <p className="text-xs text-rose-400 font-mono font-semibold">
            HTTP 400 BAD REQUEST · FRAUD RULE TRIGGERED
          </p>
        </div>
        <div className="bg-rose-950/60 border border-rose-500/50 p-4 rounded-lg mb-6 text-sm font-semibold text-rose-200 text-center">
          Blocked: Fraud threshold exceeded
        </div>
        <div className="space-y-3 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 mb-6 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-slate-700/40">
            <span className="text-slate-400">Attempted Transfer</span>
            <span className="text-rose-400 font-bold">
              $
              {attemptedAmount
                ? parseFloat(attemptedAmount).toFixed(2)
                : "10,001.00"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-700/40">
            <span className="text-slate-400">Max Fraud Ceiling</span>
            <span className="text-slate-200">$10,000.00</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Single transactions exceeding $10,000.00 are synchronously blocked by
          the Fraud Engine. Zero funds have been debited from your account.
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-md border border-slate-600 transition-colors"
          >
            Modify Amount to ≤ $10,000
          </button>
        )}
      </div>
    );
  }

  if (isInsufficient) {
    return (
      <div className="insufficient-funds-alert bg-slate-900 text-slate-100 p-6 rounded-xl border border-amber-500/40 shadow-2xl my-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/40 text-2xl">
            <XOctagon className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Transfer Rejected
          </h2>
          <p className="text-xs text-amber-400 font-mono font-semibold">
            HTTP 400 BAD REQUEST · INSUFFICIENT BALANCE
          </p>
        </div>
        <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-lg mb-6 text-sm font-semibold text-amber-200 text-center">
          Insufficient funds
        </div>
        <div className="space-y-3 bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 mb-6 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-slate-700/40">
            <span className="text-slate-400">Attempted Outflow</span>
            <span className="text-amber-400 font-bold">
              $
              {attemptedAmount
                ? parseFloat(attemptedAmount).toFixed(2)
                : "150.00"}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Your current balance is insufficient to complete this transaction.
          Please adjust the transfer amount or select a different sender
          account.
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md transition-colors"
          >
            Adjust Amount to Available Balance
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="bg-rose-900/40 border border-rose-500/50 text-rose-200 p-4 rounded-lg my-4 text-sm flex justify-between items-center"
    >
      <span>{message}</span>
      {onAction && (
        <button
          onClick={onAction}
          className="text-xs underline text-rose-300 hover:text-white"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
