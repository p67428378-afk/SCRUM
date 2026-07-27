import React, { useState, useEffect } from "react";
import { accountService, transferService } from "../../services/api";
import Button from "../common/Button";

export default function TransferForm({ onSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setFromAccount(data[0].id);
          if (data.length > 1) {
            setToAccount(data[1].id);
          }
        }
      } catch (err) {
        setError("Failed to load accounts. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
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

      setSuccess(
        `Transfer of $${parsedAmount.toFixed(2)} initiated successfully! Transaction ID: ${response.core_banking_tx_id || response.id}`,
      );
      setAmount("");
      setMemo("");
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Transfer failed. Please check your balances and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-4 text-on-surface-variant">
        Loading accounts...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-brand-emerald/10 border border-brand-emerald text-emerald rounded-lg text-sm">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          From Account
        </label>
        <select
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
          className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          required
        >
          <option value="">Select Source Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_type} ({acc.account_number_masked}) - $
              {parseFloat(acc.balance).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          To Account
        </label>
        <select
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          required
        >
          <option value="">Select Destination Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.account_type} ({acc.account_number_masked}) - $
              {parseFloat(acc.balance).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
          Amount ($)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
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
        className="w-full py-3"
        disabled={loading}
      >
        {loading ? "Processing Transfer..." : "Transfer Funds"}
      </Button>
    </form>
  );
}
