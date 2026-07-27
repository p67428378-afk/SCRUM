import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { transferService } from "../../services/api";
import Button from "../common/Button";

export default function QuickTransfer({ accounts, onTransferSuccess }) {
  const [fromAccount, setFromAccount] = useState(accounts[0]?.id || "");
  const [toAccount, setToAccount] = useState(accounts[1]?.id || "");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fromAccount || !toAccount) {
      setError("Please select both source and destination accounts.");
      return;
    }

    if (fromAccount === toAccount) {
      setError("Source and destination accounts must be different.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    setLoading(true);

    try {
      const response = await transferService.createTransfer({
        source_account_ref: fromAccount,
        destination_account_ref: toAccount,
        amount: parsedAmount,
        memo: memo || undefined,
      });

      // Success is gated on a real 2xx response
      setSuccess(
        `Transfer of $${parsedAmount.toFixed(2)} initiated successfully! Transaction ID: ${response.core_banking_tx_id || response.id}`,
      );
      setAmount("");
      setMemo("");
      if (onTransferSuccess) {
        onTransferSuccess();
      }
    } catch (err) {
      // Surfacing the failure is the correct behavior - do NOT fabricate success
      setError(
        err.response?.data?.detail ||
          "Transfer failed. Please check your balances and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-xl font-bold text-on-surface mb-4">Quick Transfer</h2>

      {error && (
        <div
          className="mb-4 p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-brand-emerald/10 border border-brand-emerald text-emerald rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleTransfer} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              From
            </label>
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} ({acc.account_number_masked}) - $
                  {parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex justify-center items-center h-10 md:col-span-1">
            <ArrowRight className="text-outline-variant" size={20} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              To
            </label>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="">Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type} ({acc.account_number_masked}) - $
                  {parseFloat(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-on-surface-variant">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 pl-8 pr-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Memo (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
              placeholder="e.g. Rent, Groceries"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full md:w-auto h-[42px] whitespace-nowrap"
            disabled={loading}
          >
            {loading ? "Transferring..." : "Initiate Transfer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
