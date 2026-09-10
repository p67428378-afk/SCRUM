import React from "react";
import { Check, Download, ArrowRight, ShieldCheck } from "lucide-react";

export default function SuccessReceipt({
  transfer,
  onReset,
  updatedBalance = 12250.0,
}) {
  if (!transfer) return null;

  const formattedAmount = parseFloat(transfer.amount || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  return (
    <div className="bg-slate-50 min-h-[500px] p-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>

        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-2">
          COMPLETED &bull; REAL-TIME RAIL
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Transfer Completed Successfully
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          Funds delivered instantly via Real-Time Settlement
        </p>

        <div className="text-3xl font-extrabold text-blue-600 mb-6">
          ${formattedAmount}{" "}
          <span className="text-lg font-semibold text-slate-500">USD</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl text-left text-sm space-y-3 mb-6 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Transaction ID:</span>
            <span className="font-mono font-medium text-xs text-slate-900 break-all">
              {transfer.id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Sender ID:</span>
            <span className="font-mono text-xs text-slate-800 break-all">
              {transfer.sender_id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Receiver ID:</span>
            <span className="font-mono text-xs text-slate-800 break-all">
              {transfer.receiver_id}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs">Status:</span>
            <span className="font-semibold text-xs text-emerald-600 uppercase">
              {transfer.status || "COMPLETED"}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <span className="text-slate-500 text-xs">Timestamp:</span>
            <span className="text-xs text-slate-700 font-medium">
              {transfer.created_at
                ? new Date(transfer.created_at).toLocaleString()
                : new Date().toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>Send Another Transfer</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => alert("PDF Receipt download started.")}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download PDF Receipt</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Apex Security Verified &bull; Reference #
            {transfer.id ? transfer.id.slice(0, 8) : "00000000"}
          </span>
        </div>
      </div>
    </div>
  );
}
