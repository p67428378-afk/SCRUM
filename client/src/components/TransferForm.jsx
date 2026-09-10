import { useState } from "react";
import PropTypes from "prop-types";
import {
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck,
  DollarSign,
} from "lucide-react";
import ValidationErrorAlert from "./ValidationErrorAlert";

export default function TransferForm({
  senderId,
  senderAccount,
  accounts,
  onSenderChange,
  onSubmit,
  isSubmitting,
  error,
  onErrorDismiss,
}) {
  const [receiverId, setReceiverId] = useState(
    "987f6543-e89b-12d3-a456-426614174000",
  );
  const [amount, setAmount] = useState("250.00");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!receiverId.trim() || !amount) return;
    onSubmit({
      sender_id: senderId,
      receiver_id: receiverId.trim(),
      amount: parseFloat(amount),
    });
  };

  const handleQuickFill = (recId, amt, customSenderId = null) => {
    setReceiverId(recId);
    setAmount(amt.toString());
    if (customSenderId && onSenderChange) {
      onSenderChange(customSenderId);
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const isAboveFraudLimit = numAmount > 10000;
  const isAboveBalance =
    senderAccount && numAmount > (senderAccount.balance || 0);

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            P2P Fund Transfer
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
            Real-time Risk Engine
          </span>
        </div>

        {/* Sender Account Switcher */}
        <div className="mb-5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
          <label
            htmlFor="sender-select"
            className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5"
          >
            Sender Account (Debited)
          </label>
          <select
            id="sender-select"
            value={senderId}
            onChange={(e) => onSenderChange && onSenderChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.owner_name} ({acc.account_number}) — Balance: $
                {acc.balance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px] truncate max-w-[240px]">
              UUID: {senderId}
            </span>
            <span className="font-semibold text-slate-700">
              Avail: $
              {senderAccount
                ? senderAccount.balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : "0.00"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recipient Account ID */}
          <div>
            <label
              htmlFor="receiver-id"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Recipient Account ID (UUID)
            </label>
            <div className="relative">
              <input
                id="receiver-id"
                type="text"
                name="receiver_id"
                required
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="987f6543-e89b-12d3-a456-426614174000"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default recipient:{" "}
              <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">
                987f6543-e89b-12d3-a456-426614174000
              </code>
            </p>
          </div>

          {/* Transfer Amount */}
          <div>
            <label
              htmlFor="amount-input"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Transfer Amount ($ USD)
            </label>
            <div
              className={`relative rounded-lg ${isAboveFraudLimit ? "ring-2 ring-red-500 bg-red-50/20" : isAboveBalance ? "ring-2 ring-amber-500 bg-amber-50/20" : ""}`}
            >
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                $
              </div>
              <input
                id="amount-input"
                type="number"
                name="amount"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250.00"
                className={`w-full pl-8 pr-3.5 py-2.5 border rounded-lg text-lg font-semibold focus:outline-none transition-all ${
                  isAboveFraudLimit
                    ? "border-red-400 text-red-900 focus:ring-2 focus:ring-red-500"
                    : isAboveBalance
                      ? "border-amber-400 text-amber-900 focus:ring-2 focus:ring-amber-500"
                      : "border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                }`}
              />
            </div>

            {/* In-form hints if threshold exceeded */}
            {isAboveFraudLimit && (
              <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Amount exceeds $10,000 maximum single-transaction fraud
                threshold limit.
              </p>
            )}
            {!isAboveFraudLimit && isAboveBalance && (
              <p className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Amount exceeds available sender balance ($
                {senderAccount ? senderAccount.balance : 0}).
              </p>
            )}
          </div>

          {/* Quick Amount presets */}
          <div className="pt-1">
            <span className="block text-xs font-medium text-slate-500 mb-1.5">
              Quick Select Amounts
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toFixed(2))}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Error display */}
          <div className="pt-2">
            <ValidationErrorAlert error={error} onDismiss={onErrorDismiss} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Transfer</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Acceptance Criteria Test Helpers */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Scenario Presets (AC Validation):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              handleQuickFill(
                "987f6543-e89b-12d3-a456-426614174000",
                "250.00",
                "123e4567-e89b-12d3-a456-426614174000",
              )
            }
            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 font-medium text-left transition-colors"
          >
            <div className="font-semibold flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Valid $250
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">
              201 Success
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFill(
                "987f6543-e89b-12d3-a456-426614174000",
                "10501.00",
                "123e4567-e89b-12d3-a456-426614174000",
              )
            }
            className="p-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg border border-red-200 font-medium text-left transition-colors"
          >
            <div className="font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> $10,501 Fraud
            </div>
            <div className="text-[10px] text-red-600 mt-0.5">
              Blocked Fraud rule
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleQuickFill(
                "987f6543-e89b-12d3-a456-426614174000",
                "500.00",
                "222e4567-e89b-12d3-a456-426614174000",
              )
            }
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 font-medium text-left transition-colors"
          >
            <div className="font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> $500 Low Bal
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">
              Insufficient funds
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

TransferForm.propTypes = {
  senderId: PropTypes.string.isRequired,
  senderAccount: PropTypes.shape({
    id: PropTypes.string,
    account_number: PropTypes.string,
    balance: PropTypes.number,
    owner_name: PropTypes.string,
    email: PropTypes.string,
  }),
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      account_number: PropTypes.string.isRequired,
      balance: PropTypes.number.isRequired,
      owner_name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSenderChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onErrorDismiss: PropTypes.func,
};

TransferForm.defaultProps = {
  senderAccount: null,
  isSubmitting: false,
  error: null,
  onErrorDismiss: null,
};
