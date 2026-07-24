import React, { useState, useEffect } from "react";
import api from "../services/api";
import ExternalAchForm from "../components/transfers/ExternalAchForm";
import LimitsCard from "../components/transfers/LimitsCard";
import StepUpModal from "../components/security/StepUpModal";

export const TransfersPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Internal Transfer State
  const [sourceAccount, setSourceAccount] = useState("");
  const [destAccount, setDestAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);

  // Step-Up State
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [stepUpAction, setStepUpAction] = useState("");
  const [stepUpAmount, setStepUpAmount] = useState(null);
  const [stepUpCallback, setStepUpCallback] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/api/v1/accounts");
      setAccounts(response.data);
    } catch (err) {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!sourceAccount || !destAccount || !amount) {
      setError("Please fill in all fields");
      return;
    }

    if (sourceAccount === destAccount) {
      setError("Source and destination accounts must be different");
      return;
    }

    setTransferLoading(true);
    try {
      const headers = {
        "Idempotency-Key": crypto.randomUUID(),
      };
      await api.post(
        "/api/v1/transfers/internal",
        {
          source_account_id: sourceAccount,
          destination_account_id: destAccount,
          amount: parseFloat(amount),
          memo: memo || null,
        },
        { headers },
      );

      setSuccess(`Successfully transferred $${amount}!`);
      setAmount("");
      setMemo("");
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.detail || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleStepUpRequired = ({ action_type, amount, onSuccess }) => {
    setStepUpAction(action_type);
    setStepUpAmount(amount || null);
    setStepUpCallback(() => onSuccess);
    setStepUpOpen(true);
  };

  const handleStepUpSuccess = () => {
    setStepUpOpen(false);
    if (stepUpCallback) {
      // Pass a mock step-up session ID for verification
      stepUpCallback("11111111-2222-3333-4444-555555555555");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Transfers & Payments</h1>
        <p className="text-slate-400">
          Move money instantly between your accounts or send funds externally
          via ACH.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Internal Transfer Form */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6">
              Internal Transfer
            </h2>
            <form onSubmit={handleInternalTransfer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    From Account
                  </label>
                  <select
                    value={sourceAccount}
                    onChange={(e) => setSourceAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} (...{acc.account_number.slice(-4)}) -
                        ${acc.available_balance}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    To Account
                  </label>
                  <select
                    value={destAccount}
                    onChange={(e) => setDestAccount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_type} (...{acc.account_number.slice(-4)}) -
                        ${acc.available_balance}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Savings transfer"
                />
              </div>

              <button
                type="submit"
                disabled={transferLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {transferLoading ? "Processing..." : "Transfer Funds"}
              </button>
            </form>
          </div>

          {/* External ACH Form */}
          <ExternalAchForm
            accounts={accounts}
            onTransferSuccess={fetchAccounts}
            onStepUpRequired={handleStepUpRequired}
          />
        </div>

        {/* Right Column: Limits */}
        <div className="lg:col-span-4">
          <LimitsCard />
        </div>
      </div>

      {/* Step-Up Modal */}
      <StepUpModal
        isOpen={stepUpOpen}
        onClose={() => setStepUpOpen(false)}
        actionType={stepUpAction}
        amount={stepUpAmount}
        onSuccess={handleStepUpSuccess}
      />
    </div>
  );
};

export default TransfersPage;
