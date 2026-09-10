import React from "react";
import { ShieldAlert, AlertTriangle, XCircle } from "lucide-react";

export default function ErrorBanner({ error, onDismiss, onAdjustAmount }) {
  if (!error) return null;

  const errorString = typeof error === "string" ? error : String(error);
  const isFraudError =
    errorString.toLowerCase().includes("fraud") ||
    errorString.toLowerCase().includes("exceeded") ||
    errorString.toLowerCase().includes("10,000");
  const isInsufficientFunds =
    errorString.toLowerCase().includes("insufficient funds") ||
    errorString.toLowerCase().includes("insufficient");

  if (isFraudError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-900 shadow-xs mb-6 relative">
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 bg-red-100 text-red-600 rounded-full shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-800">
              Blocked: Fraud threshold exceeded
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Transfers exceeding $10,000.00 USD require high-value compliance
              approval or wire verification prior to processing.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 ml-11">
          <button
            type="button"
            onClick={() => alert("Fraud Operations Helpline: 1-800-555-0199")}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-2xs"
          >
            Contact Fraud Operations
          </button>
          {onAdjustAmount && (
            <button
              type="button"
              onClick={onAdjustAmount}
              className="px-4 py-2 bg-white border border-red-300 text-red-800 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              Adjust Transfer Amount
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isInsufficientFunds) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-900 shadow-xs mb-6">
        <div className="flex items-start gap-3 mb-2">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-800">
              Insufficient funds
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Your available checking account balance is insufficient for this
              attempted transfer amount. Please adjust the amount or add funds.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 ml-11">
          {onAdjustAmount && (
            <button
              type="button"
              onClick={onAdjustAmount}
              className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-2xs"
            >
              Adjust Transfer Amount
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 shadow-xs mb-6 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-red-800">Transfer Failed</h4>
          <p className="text-xs text-red-700 mt-0.5">{errorString}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 text-xs font-medium"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
