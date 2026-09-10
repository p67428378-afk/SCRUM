import React, { useState } from "react";
import QuickAmountChips from "./QuickAmountChips";
import { Send, User, DollarSign, CreditCard } from "lucide-react";

const DEFAULT_SENDER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const SAMPLE_RECEIVER_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

export default function TransferForm({ onSubmit, loading, accounts = [] }) {
  const [senderId, setSenderId] = useState(
    accounts.length > 0 ? accounts[0].id : DEFAULT_SENDER_ID,
  );
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleQuickAmountSelect = (val) => {
    setAmount(val);
    setValidationError("");
  };

  const handleSelectSampleReceiver = (id) => {
    setReceiverId(id);
    setValidationError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    if (!senderId.trim()) {
      setValidationError("Please select or provide a Sender ID.");
      return;
    }
    if (!receiverId.trim()) {
      setValidationError("Please enter a valid Recipient ID / UUID.");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError("Please enter a transfer amount greater than $0.");
      return;
    }

    onSubmit({
      sender_id: senderId.trim(),
      receiver_id: receiverId.trim(),
      amount: numAmount,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
        <Send className="w-5 h-5 text-blue-600" />
        Initiate P2P Transfer
      </h2>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sender Account */}
        <div className="form-group">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Sender Account / ID
          </label>
          <div className="relative">
            <select
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} — $
                    {parseFloat(acc.balance || 0).toFixed(2)} USD ({acc.id})
                  </option>
                ))
              ) : (
                <option value={DEFAULT_SENDER_ID}>
                  Premier Checking (•••• 8492) — $12,500.00 USD
                </option>
              )}
            </select>
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Recipient ID */}
        <div className="form-group">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-slate-600">
              Recipient ID / UUID
            </label>
            <button
              type="button"
              onClick={() => handleSelectSampleReceiver(SAMPLE_RECEIVER_ID)}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Fill Sample Recipient
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              placeholder="e.g. b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"
              className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          </div>
        </div>

        {/* Transfer Amount */}
        <div className="form-group">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Transfer Amount ($)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="250.00"
              className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <QuickAmountChips
            selectedAmount={amount}
            onSelectAmount={handleQuickAmountSelect}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-lg shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-base mt-2 cursor-pointer"
        >
          {loading ? (
            <span>Processing Transfer...</span>
          ) : (
            <>
              <span>Send Money Now</span>
              <span>🚀</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
