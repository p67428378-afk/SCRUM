import React from "react";
import {
  CheckCircle,
  Download,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const TransferReceiptModal = ({ transfer, onClose }) => {
  if (!transfer) return null;

  const { id, sender_id, receiver_id, amount, status, created_at } = transfer;

  const formattedDate = created_at
    ? new Date(created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#0f1b3d] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Accent Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Official Bank Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-6">
          <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-full mb-3 border border-emerald-500/30">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Transfer Completed Successfully
          </h2>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
            $
            {typeof amount === "number"
              ? amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : amount}
          </p>
          <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide">
            Status: {status || "COMPLETED"}
          </span>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-4 space-y-3 border border-slate-800 text-sm mb-6">
          <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>Transaction ID (UUID)</span>
            <span
              className="font-mono text-slate-200 font-medium truncate max-w-[180px]"
              title={id}
            >
              {id}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <div className="text-left">
              <span className="text-xs text-slate-400 block">Sender</span>
              <span className="font-mono font-semibold text-slate-200">
                {sender_id}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Recipient</span>
              <span className="font-mono font-semibold text-sky-400">
                {receiver_id}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Date & Time</span>
            <span className="text-slate-300 font-mono">{formattedDate}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm transition-colors"
          >
            Close Window
          </button>
          <button
            onClick={() => alert(`Receipt downloaded for transaction ID ${id}`)}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferReceiptModal;
