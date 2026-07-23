import React, { useState, useEffect } from "react";
import LiveValidationBanner from "./LiveValidationBanner";
import SplitBreakdownChart from "./SplitBreakdownChart";

export default function SplitFundingForm({
  payees,
  accounts,
  initialData,
  onSubmit,
  onCancel,
}) {
  const [payeeId, setPayeeId] = useState(initialData?.payee_id || "");
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [frequency, setFrequency] = useState(
    initialData?.frequency || "MONTHLY",
  );
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [splits, setSplits] = useState(initialData?.splits || []);
  const [error, setError] = useState("");

  // Initialize splits if empty and accounts are available
  useEffect(() => {
    if (splits.length === 0 && accounts.length > 0) {
      setSplits([
        {
          funding_account_id: accounts[0].id,
          split_type: "PERCENTAGE",
          split_value: 100,
        },
      ]);
    }
  }, [accounts]);

  const handleAddSplit = () => {
    const unusedAccount = accounts.find(
      (acc) => !splits.some((s) => s.funding_account_id === acc.id),
    );
    const accountId = unusedAccount ? unusedAccount.id : accounts[0]?.id;
    setSplits([
      ...splits,
      {
        funding_account_id: accountId,
        split_type: "PERCENTAGE",
        split_value: 0,
      },
    ]);
  };

  const handleRemoveSplit = (index) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const handleSplitChange = (index, field, value) => {
    const updated = [...splits];
    updated[index] = { ...updated[index], [field]: value };
    setSplits(updated);
  };

  // Validation logic
  const validateSplits = () => {
    if (splits.length === 0)
      return {
        isValid: false,
        message: "At least one funding account split is required.",
      };

    const accountIds = splits.map((s) => s.funding_account_id);
    const hasDuplicates = new Set(accountIds).size !== accountIds.length;
    if (hasDuplicates)
      return {
        isValid: false,
        message: "Each funding account can only be used once.",
      };

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        isValid: false,
        message: "Please enter a valid payment amount.",
      };
    }

    let totalPercentage = 0;
    let totalFixed = 0;
    let hasMixedTypes = false;
    const firstType = splits[0]?.split_type;

    for (const split of splits) {
      if (split.split_type !== firstType) {
        hasMixedTypes = true;
      }
      const val = Number(split.split_value);
      if (isNaN(val) || val <= 0) {
        return {
          isValid: false,
          message: "Split values must be positive numbers.",
        };
      }
      if (split.split_type === "PERCENTAGE") {
        totalPercentage += val;
      } else {
        totalFixed += val;
      }
    }

    if (hasMixedTypes) {
      return {
        isValid: false,
        message:
          "All splits must use the same type (either all PERCENTAGE or all FIXED).",
      };
    }

    if (firstType === "PERCENTAGE") {
      if (totalPercentage !== 100) {
        return {
          isValid: false,
          message: `Total split percentage must equal 100% (currently ${totalPercentage}%).`,
        };
      }
    } else {
      if (Math.abs(totalFixed - numAmount) > 0.01) {
        return {
          isValid: false,
          message: `Total split fixed amount must equal the payment amount of $${numAmount.toFixed(2)} (currently $${totalFixed.toFixed(2)}).`,
        };
      }
    }

    return { isValid: true, message: "Split configuration is valid!" };
  };

  const validation = validateSplits();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!payeeId) {
      setError("Please select a payee.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!startDate) {
      setError("Please select a start date.");
      return;
    }

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    onSubmit({
      payee_id: payeeId,
      amount: Number(amount),
      frequency,
      start_date: startDate,
      description,
      splits: splits.map((s) => ({
        funding_account_id: s.funding_account_id,
        split_type: s.split_type,
        split_value: Number(s.split_value),
      })),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant space-y-6"
    >
      <h2 className="font-headline-md text-headline-md text-on-surface">
        {initialData ? "Edit Recurring Payment" : "Configure Recurring Payment"}
      </h2>

      {error && (
        <div
          className="p-4 bg-error/10 text-error text-sm rounded border border-error/20"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1">
              Payee
            </label>
            <select
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              disabled={!!initialData}
              className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="">Select a Payee</option>
              {payees.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Water bill split"
                className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Validation & Chart */}
        <div className="flex flex-col justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant">
          <LiveValidationBanner
            isValid={validation.isValid}
            message={validation.message}
          />
          <div className="flex-1 flex items-center justify-center py-4">
            <SplitBreakdownChart
              splits={splits}
              accounts={accounts}
              amount={Number(amount) || 0}
            />
          </div>
        </div>
      </div>

      {/* Splits Configuration Section */}
      <div className="space-y-4 border-t border-outline-variant pt-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-on-surface text-base">
            Funding Splits
          </h3>
          <button
            type="button"
            onClick={handleAddSplit}
            disabled={splits.length >= accounts.length}
            className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Funding Account
          </button>
        </div>

        <div className="space-y-3">
          {splits.map((split, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row items-end md:items-center gap-4 bg-surface p-4 rounded-lg border border-outline-variant"
              data-testid="split-row"
            >
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Funding Account
                </label>
                <select
                  value={split.funding_account_id}
                  onChange={(e) =>
                    handleSplitChange(
                      index,
                      "funding_account_id",
                      e.target.value,
                    )
                  }
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_provider} ({acc.account_type}) - ...
                      {acc.account_number_last4} [Bal: ${acc.balance}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-40">
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Split Type
                </label>
                <select
                  value={split.split_type}
                  onChange={(e) =>
                    handleSplitChange(index, "split_type", e.target.value)
                  }
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="w-full md:w-40">
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Value
                </label>
                <input
                  type="number"
                  step="any"
                  value={split.split_value}
                  onChange={(e) =>
                    handleSplitChange(index, "split_value", e.target.value)
                  }
                  placeholder={split.split_type === "PERCENTAGE" ? "0" : "0.00"}
                  className="w-full p-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                />
              </div>

              {splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSplit(index)}
                  className="p-2.5 text-error hover:bg-error/5 rounded-lg transition-all self-end md:self-auto"
                  title="Remove Split"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 border-t border-outline-variant pt-6">
        <button
          type="submit"
          disabled={!validation.isValid}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {initialData ? "Update Schedule" : "Create Schedule"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-surface border border-outline-variant text-on-surface-variant py-3 rounded-xl font-bold hover:bg-surface-container transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
