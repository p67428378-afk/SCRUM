import React, { useState, useEffect } from "react";
import api from "../../services/api";

export const ExternalAchForm = ({
  accounts,
  onTransferSuccess,
  onStepUpRequired,
}) => {
  const [payees, setPayees] = useState([]);
  const [selectedPayee, setSelectedPayee] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add Payee State
  const [showAddPayee, setShowAddPayee] = useState(false);
  const [newPayeeName, setNewPayeeName] = useState("");
  const [newPayeeAccount, setNewPayeeNameAccount] = useState("");
  const [newPayeeRouting, setNewPayeeRouting] = useState("");
  const [verifyingPayeeId, setVerifyingPayeeId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    fetchPayees();
  }, []);

  const fetchPayees = async () => {
    try {
      const response = await api.get("/api/v1/payees");
      setPayees(response.data);
    } catch (err) {
      setError("Failed to load payees");
    }
  };

  const handleAddPayee = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // First trigger step-up challenge for adding payee
      const stepUpRes = await api.post("/api/v1/auth/step-up", {
        action_type: "add_payee",
      });

      if (stepUpRes.data.step_up_required) {
        onStepUpRequired({
          action_type: "add_payee",
          onSuccess: async (stepUpSessionId) => {
            try {
              const response = await api.post("/api/v1/payees", {
                name: newPayeeName,
                account_number: newPayeeAccount,
                routing_number: newPayeeRouting,
                step_up_session_id: stepUpSessionId,
              });
              setVerifyingPayeeId(response.data.id);
              setSuccess(
                "Payee added! Please enter the verification code sent to your device.",
              );
              fetchPayees();
            } catch (err) {
              setError(err.response?.data?.detail || "Failed to add payee");
            }
          },
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Step-up authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayee = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`/api/v1/payees/${verifyingPayeeId}/verify`, {
        verification_code: verificationCode,
      });
      setSuccess("Payee verified successfully!");
      setVerifyingPayeeId(null);
      setShowAddPayee(false);
      setNewPayeeName("");
      setNewPayeeNameAccount("");
      setNewPayeeRouting("");
      fetchPayees();
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!sourceAccount || !selectedPayee || !amount) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const transferAmount = parseFloat(amount);

    try {
      // Check if step-up is required (e.g. large transfer > 5000)
      const stepUpRes = await api.post("/api/v1/auth/step-up", {
        action_type: "large_transfer",
        amount: transferAmount,
      });

      if (stepUpRes.data.step_up_required) {
        onStepUpRequired({
          action_type: "large_transfer",
          amount: transferAmount,
          onSuccess: async (stepUpSessionId) => {
            await executeTransfer(stepUpSessionId);
          },
        });
      } else {
        await executeTransfer();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async (stepUpSessionId = null) => {
    try {
      const headers = {
        "Idempotency-Key": crypto.randomUUID(),
      };
      const payload = {
        source_account_id: sourceAccount,
        destination_payee_id: selectedPayee,
        amount: parseFloat(amount),
        memo: memo || null,
      };
      if (stepUpSessionId) {
        payload.step_up_session_id = stepUpSessionId;
      }

      const response = await api.post("/api/v1/transfers/external", payload, {
        headers,
      });
      setSuccess(`Transfer of $${amount} initiated successfully!`);
      setAmount("");
      setMemo("");
      onTransferSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Transfer failed");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">External ACH Transfer</h2>
        <button
          onClick={() => setShowAddPayee(!showAddPayee)}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors"
        >
          {showAddPayee ? "Back to Transfer" : "+ Add New Payee"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm">
          {success}
        </div>
      )}

      {showAddPayee ? (
        verifyingPayeeId ? (
          <form onSubmit={handleVerifyPayee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter 6-digit code"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Payee"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddPayee} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Payee Name
              </label>
              <input
                type="text"
                value={newPayeeName}
                onChange={(e) => setNewPayeeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={newPayeeAccount}
                onChange={(e) => setNewPayeeNameAccount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter account number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Routing Number
              </label>
              <input
                type="text"
                value={newPayeeRouting}
                onChange={(e) => setNewPayeeRouting(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter 9-digit routing number"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Add Payee (Requires Step-Up)"}
            </button>
          </form>
        )
      ) : (
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Source Account
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
                  {acc.account_type} (...{acc.account_number.slice(-4)}) - $
                  {acc.available_balance}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Destination Payee
            </label>
            <select
              value={selectedPayee}
              onChange={(e) => setSelectedPayee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select Payee</option>
              {payees.map((payee) => (
                <option
                  key={payee.id}
                  value={payee.id}
                  disabled={payee.status !== "verified"}
                >
                  {payee.name} ({payee.status})
                </option>
              ))}
            </select>
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
              placeholder="e.g. Rent payment"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Send ACH Transfer"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ExternalAchForm;
