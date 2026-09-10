import React, { useState, useEffect } from "react";
import {
  Send,
  ShieldAlert,
  Wallet,
  UserCheck,
  DollarSign,
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import AlertBanner from "./AlertBanner";
import {
  createTransfer,
  listAccounts,
  getCurrentUserProfile,
} from "../../services/api";

const DEFAULT_SENDER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const DEFAULT_RECEIVER_ID = "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22";

const AMOUNT_PRESETS = [50, 100, 250, 500, 1000];

export default function TransferPortal({ onTransferSuccess }) {
  const [senderId, setSenderId] = useState(DEFAULT_SENDER_ID);
  const [receiverId, setReceiverId] = useState(DEFAULT_RECEIVER_ID);
  const [amount, setAmount] = useState("250.00");
  const [memo, setMemo] = useState("Dinner & shared utilities");

  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [senderBalance, setSenderBalance] = useState(25000.0);
  const [isLoading, setIsLoading] = useState(false);

  const [alert, setAlert] = useState(null); // { type: 'success' | 'error' | 'warning', message: string, title?: string }

  // Load user accounts & balances on mount
  useEffect(() => {
    async function loadAccountData() {
      try {
        const accounts = await listAccounts();
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAvailableAccounts(accounts);
          const currentSender = accounts.find(
            (acc) => acc.id === senderId || acc.user_id === senderId,
          );
          if (currentSender) {
            setSenderBalance(Number(currentSender.balance));
          }
        }
      } catch (err) {
        // Fallback gracefully without blocking the UI
      }
    }
    loadAccountData();
  }, [senderId]);

  const handleSenderChange = (newSenderId) => {
    setSenderId(newSenderId);
    const selected = availableAccounts.find(
      (acc) => acc.id === newSenderId || acc.user_id === newSenderId,
    );
    if (selected) {
      setSenderBalance(Number(selected.balance));
    }
  };

  const validateForm = () => {
    if (!senderId || senderId.trim() === "") {
      setAlert({
        type: "error",
        title: "Validation Error",
        message: "Sender account ID is required.",
      });
      return false;
    }

    if (!receiverId || receiverId.trim() === "") {
      setAlert({
        type: "error",
        title: "Validation Error",
        message:
          "Recipient ID is required. Please enter a valid recipient UUID.",
      });
      return false;
    }

    if (senderId.trim().toLowerCase() === receiverId.trim().toLowerCase()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        message: "Sender and Recipient cannot be the same account.",
      });
      return false;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlert({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid transfer amount greater than $0.00.",
      });
      return false;
    }

    return true;
  };

  const handlePresetClick = (preset) => {
    setAmount(preset.toFixed(2));
    setAlert(null);
  };

  const handleQuickTest = (type) => {
    if (type === "normal") {
      setReceiverId(DEFAULT_RECEIVER_ID);
      setAmount("250.00");
      setAlert(null);
    } else if (type === "fraud") {
      setReceiverId(DEFAULT_RECEIVER_ID);
      setAmount("10001.00");
      setAlert({
        type: "warning",
        title: "Test Case: Fraud Limit Rule",
        message:
          "Amounts > $10,000 will be synchronously flagged and blocked by backend fraud rules.",
      });
    } else if (type === "insufficient") {
      setReceiverId(DEFAULT_RECEIVER_ID);
      setAmount("50000.00");
      setAlert({
        type: "warning",
        title: "Test Case: Insufficient Funds",
        message:
          "Amount exceeds sender available balance ($25,000) and will trigger an insufficient funds rejection.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        sender_id: senderId.trim(),
        receiver_id: receiverId.trim(),
        amount: parseFloat(amount),
      };

      const result = await createTransfer(payload);

      // Successfully processed (HTTP 201)
      setAlert({
        type: "success",
        title: "Transfer Completed",
        message: `Successfully transferred $${parseFloat(amount).toFixed(2)} to recipient.`,
      });

      // Update local balance
      setSenderBalance((prev) => Math.max(0, prev - parseFloat(amount)));

      // Notify parent component to open receipt modal and refresh audit ledger
      if (onTransferSuccess) {
        onTransferSuccess(result);
      }
    } catch (err) {
      let errorMessage = "An unexpected error occurred during the transfer.";

      if (err.response && err.response.data) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // 422 validation errors array
          errorMessage = detail.map((d) => d.msg || "Invalid field").join(", ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setAlert({
        type: "error",
        title: "Transfer Blocked",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                P2P TRANSFER ENGINE
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Real-Time Fraud Guard
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-2">Send Money Instantly</h2>
            <p className="text-slate-300 text-sm mt-1">
              Transfer funds securely to any peer account with zero transaction
              fees.
            </p>
          </div>

          {/* Account Balance Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Available Balance
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                USD
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              $
              {senderBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 font-mono truncate">
              ID: {senderId.slice(0, 14)}...
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Dynamic Alert Banner */}
        {alert && (
          <AlertBanner
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Account Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              From (Sender Account)
            </label>
            <div className="relative">
              <input
                type="text"
                value={senderId}
                onChange={(e) => handleSenderChange(e.target.value)}
                placeholder="Sender UUID"
                className="w-full font-mono text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Default demo sender is seeded with $25,000.00 USD balance.
            </p>
          </div>

          {/* Recipient Account Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                To (Recipient Account UUID)
              </label>
              <button
                type="button"
                onClick={() => setReceiverId(DEFAULT_RECEIVER_ID)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Use Demo Recipient
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <input
                type="text"
                id="receiver-id-input"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="e.g. b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22"
                className="w-full font-mono text-sm pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
                required
              />
            </div>
          </div>

          {/* Transfer Amount Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Transfer Amount ($ USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-6 h-6 font-bold text-slate-700" />
              </div>
              <input
                type="number"
                id="amount-input"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-bold pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900"
                required
              />
            </div>

            {/* Amount Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-slate-500 font-medium mr-1">
                Quick Select:
              </span>
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    parseFloat(amount) === preset
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Memo / Notes Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Payment Memo / Note (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What is this transfer for?"
              className="w-full text-sm px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Security Rules Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Automated Compliance & Fraud Rules</span>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
              <li>
                Transfers exceeding <strong>$10,000.00</strong> will be blocked
                synchronously.
              </li>
              <li>
                Transfers exceeding current available balance will be rejected.
              </li>
              <li>
                Transactions are verified and logged in the immutable audit
                ledger.
              </li>
            </ul>

            {/* Quick Test Scenarios Trigger Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">
                Quick Test Scenarios:
              </span>
              <button
                type="button"
                onClick={() => handleQuickTest("normal")}
                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hover:bg-emerald-100"
              >
                Standard Transfer ($250)
              </button>
              <button
                type="button"
                onClick={() => handleQuickTest("fraud")}
                className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium hover:bg-amber-100"
              >
                Trigger Fraud Rule ($10,001)
              </button>
              <button
                type="button"
                onClick={() => handleQuickTest("insufficient")}
                className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium hover:bg-rose-100"
              >
                Insufficient Funds ($50,000)
              </button>
            </div>
          </div>

          {/* Primary Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Securing & Processing Transfer...</span>
              </div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Transfer Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
