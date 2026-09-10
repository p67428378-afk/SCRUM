import PropTypes from "prop-types";
import { AlertOctagon, AlertTriangle, X } from "lucide-react";

export default function TransferErrorBanner({ error, onDismiss }) {
  if (!error) return null;

  const isFraudError =
    typeof error === "string" &&
    (error.toLowerCase().includes("fraud") ||
      error.toLowerCase().includes("threshold") ||
      error.toLowerCase().includes("blocked"));

  const isInsufficientFunds =
    typeof error === "string" &&
    (error.toLowerCase().includes("insufficient") ||
      error.toLowerCase().includes("balance"));

  if (isFraudError) {
    return (
      <div
        role="alert"
        className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 text-red-950 shadow-sm relative transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl mt-0.5">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🚨</span>
                <h3 className="text-lg font-bold text-red-900 tracking-tight">
                  Blocked: Fraud threshold exceeded
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-red-800 leading-relaxed">
                {error ||
                  "Transfer request violates the institutional non-cleared P2P compliance threshold of $10,000.00 USD (Risk Rule SEC-409B). This transaction has been intercepted and blocked."}
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-red-700 bg-red-100/80 px-3 py-1 rounded-lg w-fit">
                <span>
                  Compliance Rule: Maximum single transfer is $10,000.00 USD
                </span>
              </div>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition"
              aria-label="Dismiss error"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isInsufficientFunds) {
    return (
      <div
        role="alert"
        className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-amber-950 shadow-sm relative transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-bold text-amber-900 tracking-tight">
                  Insufficient funds
                </h3>
              </div>
              <p className="mt-1.5 text-sm text-amber-800 leading-relaxed">
                {error ||
                  "The requested transfer amount exceeds your available primary settlement balance. Please reduce the amount or deposit funds into your account."}
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-amber-500 hover:text-amber-800 p-1 rounded-lg hover:bg-amber-100 transition"
              aria-label="Dismiss error"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-300 rounded-2xl p-4 text-red-900 shadow-sm flex items-start justify-between"
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm text-red-900">
            Transfer Request Failed
          </h4>
          <p className="text-sm text-red-700 mt-0.5">{error}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-700 p-1 rounded hover:bg-red-100 transition"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

TransferErrorBanner.propTypes = {
  error: PropTypes.string,
  onDismiss: PropTypes.func,
};
