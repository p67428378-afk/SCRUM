import { useState } from "react";
import PropTypes from "prop-types";
import {
  Send,
  DollarSign,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Loader2,
} from "lucide-react";

const RECIPIENT_SHORTCUTS = [
  {
    id: "usr_987654",
    name: "Marcus Vance",
    handle: "usr_987654",
    hint: "Peer",
  },
  { id: "usr_admin", name: "System Admin", handle: "usr_admin", hint: "Admin" },
  {
    id: "usr_lowbalance",
    name: "Low Balance User",
    handle: "usr_lowbalance",
    hint: "Test",
  },
];

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export default function TransferForm({
  senderId = "usr_alexander",
  senderBalance = 5000.0,
  onSubmitTransfer,
  isLoading = false,
}) {
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [clientValidation, setClientValidation] = useState(null);

  const handleAmountPreset = (preset) => {
    setAmount(preset.toString());
    setClientValidation(null);
  };

  const handleSelectShortcut = (handle) => {
    setReceiverId(handle);
    setClientValidation(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientValidation(null);

    const trimmedReceiver = receiverId.trim();
    const numAmount = parseFloat(amount);

    if (!trimmedReceiver) {
      setClientValidation(
        "Please enter a valid recipient ID, handle, or UUID.",
      );
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setClientValidation("Please enter a positive transfer amount.");
      return;
    }

    if (trimmedReceiver.toLowerCase() === senderId.trim().toLowerCase()) {
      setClientValidation("Sender and recipient cannot be the same account.");
      return;
    }

    onSubmitTransfer({
      sender_id: senderId,
      receiver_id: trimmedReceiver,
      amount: numAmount,
    });
  };

  const isAmountOverFraudLimit = parseFloat(amount) > 10000;
  const isAmountOverBalance = parseFloat(amount) > senderBalance;

  return (
    <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200/80 shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Send Money</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant zero-fee transfer to any SecureBank user or handle.
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          P2P Active
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Recipient Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="receiver_id"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Recipient ID, Handle or UUID
            </label>
            <span className="text-xs text-slate-400">e.g., usr_987654</span>
          </div>

          <div className="relative">
            <input
              id="receiver_id"
              name="receiver_id"
              type="text"
              placeholder="usr_987654"
              value={receiverId}
              onChange={(e) => {
                setReceiverId(e.target.value);
                if (clientValidation) setClientValidation(null);
              }}
              required
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/70 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 text-sm font-medium transition placeholder:text-slate-400"
            />
            {receiverId && (
              <UserCheck className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
            )}
          </div>

          {/* Recipient Quick Suggestions */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">
              Quick pick:
            </span>
            {RECIPIENT_SHORTCUTS.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectShortcut(sc.handle)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  receiverId === sc.handle
                    ? "bg-blue-600 text-white border-blue-600 font-medium shadow-sm"
                    : "bg-slate-100/80 hover:bg-slate-200 text-slate-700 border-slate-200/80"
                }`}
              >
                {sc.name}{" "}
                <span className="opacity-70 text-[10px]">({sc.handle})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor="amount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              Transfer Amount ($ USD)
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Max: $10,000.00 / txn
            </span>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="500.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (clientValidation) setClientValidation(null);
              }}
              required
              className={`w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border rounded-xl text-slate-900 text-base font-semibold transition focus:ring-2 placeholder:text-slate-400 ${
                isAmountOverFraudLimit
                  ? "border-red-400 bg-red-50/40 focus:border-red-600 focus:ring-red-100 text-red-900"
                  : isAmountOverBalance
                    ? "border-amber-400 bg-amber-50/40 focus:border-amber-600 focus:ring-amber-100"
                    : "border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-blue-100"
              }`}
            />
          </div>

          {/* Warnings for Fraud Limit or Insufficient Balance preview */}
          {isAmountOverFraudLimit && (
            <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              <span>
                Warning: Amount exceeds $10,000 fraud threshold and will be
                blocked by backend.
              </span>
            </p>
          )}

          {!isAmountOverFraudLimit && isAmountOverBalance && (
            <p className="mt-1.5 text-xs text-amber-700 font-medium flex items-center space-x-1">
              <span>
                Warning: Amount exceeds your balance ($
                {senderBalance.toFixed(2)}) and will trigger &quot;Insufficient
                funds&quot;.
              </span>
            </p>
          )}

          {/* Quick Amount Presets */}
          <div className="mt-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                Presets:
              </span>
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAmountPreset(preset)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                    amount === preset.toString()
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Test Case Quick Buttons for QA convenience */}
            <div className="mt-2 pt-2 border-t border-dashed border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Test Shortcuts:
              </span>
              <button
                type="button"
                onClick={() => handleAmountPreset(10001)}
                className="text-[11px] px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-medium transition"
                title="Test Synchronous Fraud Block"
              >
                🚨 $10,001 (Fraud Test)
              </button>
              <button
                type="button"
                onClick={() => handleAmountPreset(6000)}
                className="text-[11px] px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium transition"
                title="Test Insufficient Funds Block"
              >
                ⚠️ $6,000 (Insufficient Funds)
              </button>
            </div>
          </div>
        </div>

        {/* Client Validation Error */}
        {clientValidation && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
            {clientValidation}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verifying &amp; Transferring...</span>
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
  );
}

TransferForm.propTypes = {
  senderId: PropTypes.string,
  senderBalance: PropTypes.number,
  onSubmitTransfer: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};
