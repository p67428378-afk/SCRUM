import React from "react";
import { AlertTriangle, ShieldX, XCircle, CheckCircle2 } from "lucide-react";

const FraudAlertBanner = ({ error, successMessage, onClose }) => {
  if (!error && !successMessage) return null;

  if (successMessage) {
    return (
      <div
        className="mb-6 p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-200 flex items-start justify-between shadow-lg animate-fadeIn"
        role="status"
      >
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-emerald-300">
              Transfer Executed
            </h4>
            <p className="text-sm text-emerald-200/90">{successMessage}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-emerald-200 text-sm font-bold ml-4 p-1"
            aria-label="Close message"
          >
            ✕
          </button>
        )}
      </div>
    );
  }

  const isFraud =
    error.toLowerCase().includes("fraud") ||
    error.toLowerCase().includes("blocked");

  return (
    <div
      className={`mb-6 p-4 rounded-xl border flex items-start justify-between shadow-lg animate-fadeIn ${
        isFraud
          ? "bg-red-950/90 border-red-500/60 text-red-100"
          : "bg-amber-950/90 border-amber-500/60 text-amber-100"
      }`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {isFraud ? (
          <ShieldX className="w-6 h-6 text-red-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <h4 className="font-bold text-base tracking-wide flex items-center gap-2">
            {isFraud
              ? "SECURITY ALERT - TRANSFER BLOCKED"
              : "TRANSACTION REJECTED"}
          </h4>
          <p className="text-sm font-medium mt-1 font-mono text-red-200">
            {error}
          </p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-sm font-bold ml-4 p-1"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default FraudAlertBanner;
