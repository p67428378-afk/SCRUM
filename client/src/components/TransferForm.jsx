import React, { useState } from "react";
import { Send, DollarSign, UserCheck, UserX } from "lucide-react";

const TransferForm = ({ senderId = "usr_12345", onSubmit, isLoading }) => {
  const [receiverId, setReceiverId] = useState("usr_98765");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  const quickAmounts = [50, 100, 250, 1000, 10001];

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!receiverId.trim()) {
      setFormError("Please enter a recipient ID");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid transfer amount greater than $0");
      return;
    }

    onSubmit({
      sender_id: senderId,
      receiver_id: receiverId.trim(),
      amount: numAmount,
    });
  };

  return (
    <div className="bg-[#0f1b3d] border border-slate-700/60 rounded-xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-emerald-400" />
        New P2P Transfer
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="receiver_id"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
          >
            Recipient User / Account ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <input
              id="receiver_id"
              name="receiver_id"
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="e.g. usr_98765"
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
          >
            Transfer Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-11 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono text-lg font-bold"
              required
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 self-center mr-1">
              Quick Select:
            </span>
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                  val > 10000
                    ? "bg-red-950/40 text-red-300 border-red-800/60 hover:bg-red-900/60"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                ${val.toLocaleString()} {val > 10000 ? "(Fraud Test)" : ""}
              </button>
            ))}
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <UserX className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center space-x-2 text-base"
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              <span>Processing Transfer...</span>
            </span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Send Money Now</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
