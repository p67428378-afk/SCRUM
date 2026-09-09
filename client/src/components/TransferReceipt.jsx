import React from "react";

export default function TransferReceipt({ transfer }) {
  if (!transfer) return null;

  return (
    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700/50 font-mono text-xs space-y-2">
      <h3 className="text-sm font-bold text-emerald-400 mb-2">
        Receipt Details
      </h3>
      <div className="flex justify-between py-1 border-b border-slate-700/40">
        <span className="text-slate-400">Transaction ID</span>
        <span className="text-slate-200 font-semibold">{transfer.id}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-slate-700/40">
        <span className="text-slate-400">Sender ID</span>
        <span className="text-slate-200">{transfer.sender_id}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-slate-700/40">
        <span className="text-slate-400">Receiver ID</span>
        <span className="text-slate-200">{transfer.receiver_id}</span>
      </div>
      <div className="flex justify-between py-1 border-b border-slate-700/40">
        <span className="text-slate-400">Amount</span>
        <span className="text-emerald-400 font-bold">
          ${parseFloat(transfer.amount).toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between py-1">
        <span className="text-slate-400">Status</span>
        <span className="text-emerald-300 font-semibold">
          {transfer.status}
        </span>
      </div>
    </div>
  );
}
