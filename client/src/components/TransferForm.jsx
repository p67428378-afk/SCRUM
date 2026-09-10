import React, { useState } from "react";
import { Send, Shield, ArrowRight } from "lucide-react";

export default function TransferForm({ senderId, onSubmit, loading }) {
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  const quickAmounts = [50, 100, 500, 1000];

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    const trimmedReceiver = receiverId.trim();
    if (!trimmedReceiver) {
      setValidationError("Please enter a recipient Account UUID.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setValidationError(
        "Please enter a valid transfer amount greater than $0.00.",
      );
      return;
    }

    onSubmit({
      sender_id: senderId,
      receiver_id: trimmedReceiver,
      amount: numericAmount,
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-400" />
          Send Peer-to-Peer Payment
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          FastAPI Real-time Engine
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div
            className="bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2"
            role="alert"
          >
            <span>⚠️</span> {validationError}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Recipient Account ID (UUID)
          </label>
          <input
            type="text"
            required
            value={receiverId}
            onChange={(e) => {
              setReceiverId(e.target.value);
              setValidationError("");
            }}
            placeholder="e.g., b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Transfer Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-lg font-bold text-emerald-400">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setValidationError("");
              }}
              placeholder="150.00"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-8 pr-3 text-lg font-bold text-emerald-400 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400 mb-2">
            Quick Amount Select
          </span>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                  amount === val.toString()
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-slate-700/60 hover:bg-slate-700 border-slate-600 text-slate-200"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 text-xs text-slate-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">
              Automated Fraud Detection:
            </strong>{" "}
            Single transfers capped at $10,000.00. Transfers exceeding available
            funds will be blocked.
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-slate-900">
              <svg
                className="animate-spin h-5 w-5 text-slate-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing Synchronous Checks...
            </span>
          ) : (
            <>
              Send Transfer Now <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
