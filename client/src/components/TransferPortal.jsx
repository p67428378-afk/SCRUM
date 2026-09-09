import React, { useState, useEffect } from "react";
import StatCard from "./StatCard.jsx";
import StatusBanner from "./StatusBanner.jsx";
import TransferReceipt from "./TransferReceipt.jsx";
import {
  transferMoney,
  fetchAccounts,
  fetchTransfers,
} from "../services/api.js";

export default function TransferPortal() {
  const [senderId, setSenderId] = useState(
    "550e8400-e29b-41d4-a716-446655440000",
  );
  const [receiverId, setReceiverId] = useState(
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  );
  const [amount, setAmount] = useState("250.00");

  const [statusState, setStatusState] = useState({
    type: null,
    message: null,
    details: null,
  });
  const [attemptedAmount, setAttemptedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [senderBalance, setSenderBalance] = useState("12,450.00");
  const [recentTransfers, setRecentTransfers] = useState([]);

  useEffect(() => {
    loadAccountsAndTransfers();
  }, []);

  const loadAccountsAndTransfers = async () => {
    try {
      const accList = await fetchAccounts();
      if (accList && accList.length > 0) {
        setAccounts(accList);
        const currentSender = accList.find((a) => a.id === senderId);
        if (currentSender) {
          setSenderBalance(
            parseFloat(currentSender.balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            }),
          );
        }
      }
    } catch (e) {
      console.warn(
        "Could not load accounts list from API, using default view:",
        e.message,
      );
    }

    try {
      const transfers = await fetchTransfers();
      if (transfers) {
        setRecentTransfers(transfers);
      }
    } catch (e) {
      console.warn("Could not load transfers history from API:", e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusState({ type: null, message: null, details: null });
    setAttemptedAmount(amount);
    setLoading(true);

    try {
      const data = await transferMoney({
        sender_id: senderId,
        receiver_id: receiverId,
        amount,
      });
      setStatusState({
        type: "success",
        message: "Transfer Completed Successfully!",
        details: data,
      });
      // Refresh accounts & transfers on success
      loadAccountsAndTransfers();
    } catch (err) {
      const detailMsg =
        err.response?.data?.detail ||
        err.message ||
        "An error occurred during transfer";
      setStatusState({
        type: "error",
        message: detailMsg,
        details: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatusState({ type: null, message: null, details: null });
    setAmount("250.00");
  };

  return (
    <div className="p2p-transfer-portal bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 shadow-xl max-w-4xl mx-auto my-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">
            SecureBank P2P Portal
          </h1>
          <p className="text-xs text-slate-400">
            Real-time peer-to-peer transfer module
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-mono rounded-full border border-emerald-500/30">
            TLS 1.3 VERIFIED
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
            AJ
          </div>
        </div>
      </header>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Sender Account ID"
          value={senderId}
          subtext="Sender UUID"
          valueColor="text-slate-200"
        />
        <StatCard
          label="Available Balance"
          value={`$${senderBalance}`}
          subtext="Updated Ledger Balance"
          valueColor="text-white"
        />
        <StatCard
          label="Max Fraud Limit"
          value="$10,000.00"
          subtext="Synchronous Fraud Rule Ceiling"
          valueColor="text-emerald-400"
        />
      </div>

      {/* Account Selector if accounts are populated */}
      {accounts.length > 0 && (
        <div className="mb-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/40">
          <label className="block text-xs font-medium text-slate-300 uppercase mb-2">
            Select Active Account
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  setSenderId(acc.id);
                  setSenderBalance(
                    parseFloat(acc.balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    }),
                  );
                }}
                className={`p-3 rounded-md border text-left text-xs font-mono transition-all ${
                  senderId === acc.id
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
              >
                <p className="font-bold">
                  {acc.account_number} ({acc.currency})
                </p>
                <p className="truncate text-[11px] text-slate-400">{acc.id}</p>
                <p className="text-emerald-400 font-semibold mt-1">
                  Balance: ${parseFloat(acc.balance).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Alert Banners */}
      <StatusBanner
        type={statusState.type}
        message={statusState.message}
        attemptedAmount={attemptedAmount}
        details={statusState.details}
        onAction={handleReset}
      />

      {/* Transfer Form */}
      {statusState.type !== "success" && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-slate-800/40 p-6 rounded-lg border border-slate-700/40"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
              Sender Account UUID (You)
            </label>
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-950 text-slate-100 rounded-md border border-slate-700 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
              Recipient Account UUID (Receiver)
            </label>
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
              placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
              className="w-full px-4 py-2 bg-slate-950 text-slate-100 rounded-md border border-slate-700 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
              Transfer Amount ($ USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 250.00"
              step="0.01"
              min="0.01"
              required
              className="w-full px-4 py-2 bg-slate-950 text-slate-100 rounded-md border border-slate-700 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-md shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>
              {loading ? "Processing Transfer..." : "Send Transfer Now"}
            </span>
          </button>
        </form>
      )}

      {/* Recent Transfers List */}
      {recentTransfers.length > 0 && (
        <div className="mt-8 bg-slate-800/40 p-6 rounded-lg border border-slate-700/40">
          <h3 className="text-lg font-bold text-white mb-4">
            Recent P2P Transfers
          </h3>
          <div className="space-y-3">
            {recentTransfers.slice(0, 5).map((t) => (
              <TransferReceipt key={t.id} transfer={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
