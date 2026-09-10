import React from "react";
import { AlertTriangle, AlertCircle, XCircle } from "lucide-react";

export default function StatusAlertBanner({ error, onClose }) {
  if (!error) return null;

  const errorMsg =
    typeof error === "string" ? error : error?.message || "An error occurred";
  const isFraud =
    errorMsg.toLowerCase().includes("fraud") ||
    errorMsg.toLowerCase().includes("threshold") ||
    errorMsg.includes("10,000");
  const isInsufficient =
    errorMsg.toLowerCase().includes("insufficient") ||
    errorMsg.toLowerCase().includes("funds");

  if (isFraud) {
    return (
      <div className="bg-rose-950/90 border border-rose-500/50 rounded-xl p-5 flex items-start space-x-4 text-white shadow-lg animate-fadeIn relative">
        <div className="p-2 bg-rose-900/60 rounded-lg text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="text-base font-bold text-rose-400">
            Blocked: Fraud threshold exceeded
          </h3>
          <p className="text-xs text-rose-200 mt-1 leading-relaxed">
            Transfers exceeding $10,000.00 trigger synchronous fraud prevention
            rules and are automatically blocked. Please contact support for wire
            transfers.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close error message"
            className="text-rose-400 hover:text-white text-sm p-1 rounded transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  if (isInsufficient) {
    return (
      <div className="bg-amber-950/90 border border-amber-500/50 rounded-xl p-5 flex items-start space-x-4 text-white shadow-lg animate-fadeIn relative">
        <div className="p-2 bg-amber-900/60 rounded-lg text-amber-400 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="flex-1 pr-6">
          <h3 className="text-base font-bold text-amber-400">
            Insufficient funds
          </h3>
          <p className="text-xs text-amber-200 mt-1 leading-relaxed">
            The transfer amount exceeds your current available balance. Please
            lower the transfer amount or add funds.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close error message"
            className="text-amber-400 hover:text-white text-sm p-1 rounded transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-rose-950/90 border border-rose-500/50 rounded-xl p-5 flex items-start space-x-4 text-white shadow-lg animate-fadeIn relative">
      <div className="p-2 bg-rose-900/60 rounded-lg text-rose-400 shrink-0">
        <XCircle className="w-6 h-6" />
      </div>
      <div className="flex-1 pr-6">
        <h3 className="text-base font-bold text-rose-400">
          Transfer Request Error
        </h3>
        <p className="text-xs text-rose-200 mt-1 leading-relaxed">{errorMsg}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close error message"
          className="text-rose-400 hover:text-white text-sm p-1 rounded transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
