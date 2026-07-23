import React, { useState, useEffect } from "react";
import SplitFundingForm from "../components/payments/SplitFundingForm";
import { paymentsService } from "../services/api";

export default function ConfigurePaymentPage({
  initialSchedule,
  onSave,
  onCancel,
}) {
  const [payees, setPayees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [payeesData, accountsData] = await Promise.all([
          paymentsService.getPayees(),
          paymentsService.getAccounts(),
        ]);
        setPayees(payeesData);
        setAccounts(accountsData);
      } catch (err) {
        setError("Failed to load payees or funding accounts.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (scheduleData) => {
    try {
      if (initialSchedule) {
        await paymentsService.updateSchedule(initialSchedule.id, scheduleData);
      } else {
        await paymentsService.createSchedule(scheduleData);
      }
      onSave();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to save recurring payment schedule.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-5xl animate-spin text-primary">
            sync
          </span>
          <p className="text-on-surface-variant font-semibold">
            Loading Configuration Form...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface font-bold text-sm transition-all"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Dashboard
      </button>

      {error && (
        <div className="p-4 bg-error/10 text-on-error-container text-sm rounded-xl border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <SplitFundingForm
        payees={payees}
        accounts={accounts}
        initialData={initialSchedule}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
