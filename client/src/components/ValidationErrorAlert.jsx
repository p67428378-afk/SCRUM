import PropTypes from "prop-types";
import { AlertTriangle, XCircle, X } from "lucide-react";

export default function ValidationErrorAlert({ error, onDismiss }) {
  if (!error) return null;

  let errorMessage = "";
  let errorStatus = null;

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object") {
    if (error.response && error.response.data) {
      errorStatus = error.response.status;
      const data = error.response.data;
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail
          .map((err) => `${err.loc ? err.loc.join(".") + ": " : ""}${err.msg}`)
          .join(", ");
      } else {
        errorMessage = JSON.stringify(data);
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = "An unexpected error occurred during transfer.";
    }
  }

  const isFraud =
    errorMessage.includes("Fraud threshold exceeded") ||
    errorMessage.includes("Blocked");
  const isInsufficient = errorMessage.includes("Insufficient funds");

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-sm transition-all ${
        isFraud
          ? "bg-red-50 border-red-200 text-red-900"
          : isInsufficient
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-rose-50 border-rose-200 text-rose-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isFraud ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : isInsufficient ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-tight">
            {errorStatus ? `HTTP ${errorStatus} • ` : ""}
            {errorMessage}
          </h4>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {isFraud
              ? "Transfer amount exceeds $10,000.00 maximum per-transaction threshold defined by risk engine policies."
              : isInsufficient
                ? "Requested transfer amount exceeds available unencumbered account balance."
                : "Please correct the highlighted fields and retry your transfer."}
          </p>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

ValidationErrorAlert.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string,
      response: PropTypes.shape({
        status: PropTypes.number,
        data: PropTypes.shape({
          detail: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.array,
            PropTypes.object,
          ]),
        }),
      }),
    }),
  ]),
  onDismiss: PropTypes.func,
};
