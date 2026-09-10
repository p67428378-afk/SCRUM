import React from "react";
import { CheckCircle2, Printer, X } from "lucide-react";

export default function TransferReceiptModal({ transfer, onClose }) {
  if (!transfer) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedAmount =
    typeof transfer.amount === "number"
      ? transfer.amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : transfer.amount;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-emerald-400">
            Transfer Completed Successfully
          </h2>
          <p className="text-3xl font-black text-white mt-1">
            ${formattedAmount}{" "}
            <span className="text-sm font-normal text-slate-400">USD</span>
          </p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl text-left text-xs font-mono space-y-2 border border-slate-800 text-slate-300">
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Ref UUID:</span>
            <span
              className="text-emerald-400 font-semibold truncate max-w-[220px]"
              title={transfer.id}
            >
              {transfer.id}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Sender ID:</span>
            <span
              className="text-slate-200 truncate max-w-[220px]"
              title={transfer.sender_id}
            >
              {transfer.sender_id}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Recipient ID:</span>
            <span
              className="text-slate-200 truncate max-w-[220px]"
              title={transfer.receiver_id}
            >
              {transfer.receiver_id}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Status:</span>
            <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
              {transfer.status || "COMPLETED"}
            </span>
          </div>
          {transfer.created_at && (
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-400">
                {new Date(transfer.created_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-lg text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
