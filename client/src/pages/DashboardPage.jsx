import React, { useState, useEffect } from "react";
import PaymentsTable from "../components/payments/PaymentsTable";
import LinkedAccountsList from "../components/payments/LinkedAccountsList";
import { paymentsService } from "../services/api";

export default function DashboardPage({ onCreateNew, onEdit, onLogout }) {
  const [schedules, setSchedules] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, accountsData, payeesData] = await Promise.all([
        paymentsService.getSchedules(),
        paymentsService.getAccounts(),
        paymentsService.getPayees(),
      ]);
      setSchedules(schedulesData);
      setAccounts(accountsData);
      setPayees(payeesData);
    } catch (err) {
      setError(
        "Failed to load dashboard data. Please make sure you are logged in.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLinkAccount = async (accountData) => {
    const newAccount = await paymentsService.linkAccount(accountData);
    setAccounts([...accounts, newAccount]);
    setSuccessMessage("Account linked successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleUnlinkAccount = async (accountId) => {
    if (window.confirm("Are you sure you want to unlink this account?")) {
      await paymentsService.unlinkAccount(accountId);
      setAccounts(accounts.filter((a) => a.id !== accountId));
      setSuccessMessage("Account unlinked successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel this recurring payment schedule?",
      )
    ) {
      await paymentsService.cancelSchedule(scheduleId);
      setSchedules(schedules.filter((s) => s.id !== scheduleId));
      setSuccessMessage("Recurring payment cancelled successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleExecuteSchedule = async (scheduleId) => {
    try {
      const tx = await paymentsService.executeSchedule(scheduleId);
      setSuccessMessage(
        `Payment executed successfully! Transaction ID: ${tx.gateway_transaction_id || tx.id}`,
      );
      setTimeout(() => setSuccessMessage(""), 5000);
      // Refresh accounts to update balances
      const accountsData = await paymentsService.getAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to execute payment.");
      setTimeout(() => setError(""), 5000);
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
            Loading ApexBank Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalScheduled = schedules.reduce(
    (sum, s) => sum + (s.is_active ? Number(s.amount) : 0),
    0,
  );
  const activeSplitsCount = schedules.filter(
    (s) => s.is_active && s.splits?.length > 1,
  ).length;
  const nextPayment =
    schedules.length > 0
      ? schedules.reduce((earliest, s) => {
          if (!earliest) return s;
          return new Date(s.next_payment_date) <
            new Date(earliest.next_payment_date)
            ? s
            : earliest;
        }, null)
      : null;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="font-display-lg text-display-lg text-on-surface">
            Recurring Payments
          </h1>
          <p className="text-on-surface-variant text-body-md">
            Manage your automated bill settlements and account distributions.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="bg-surface border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-container transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Logout
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-secondary/10 text-on-secondary-container text-sm rounded-xl border border-secondary/20 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 text-on-error-container text-sm rounded-xl border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-lg hover:shadow-on-surface/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-outline font-label-md uppercase tracking-wider">
              Total Scheduled Bills
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
              payments
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-1">
            ${totalScheduled.toFixed(2)}
          </div>
          <div className="text-on-surface-variant text-body-md">
            {schedules.filter((s) => s.is_active).length} active schedules
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-lg hover:shadow-on-surface/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-outline font-label-md uppercase tracking-wider">
              Linked Funding Sources
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
              account_tree
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-1">
            {accounts.length} Accounts
          </div>
          <div className="text-on-surface-variant text-body-md">
            {accounts.filter((a) => a.account_type === "CHECKING").length}{" "}
            checking,{" "}
            {accounts.filter((a) => a.account_type === "SAVINGS").length}{" "}
            savings
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-lg hover:shadow-on-surface/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-outline font-label-md uppercase tracking-wider">
              Next Scheduled Payment
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
              event_upcoming
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-1 text-primary">
            {nextPayment ? nextPayment.next_payment_date : "None"}
          </div>
          <div className="text-on-surface-variant text-body-md">
            {nextPayment
              ? `$${Number(nextPayment.amount).toFixed(2)} - ${nextPayment.payee?.name}`
              : "No upcoming payments"}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:shadow-lg hover:shadow-on-surface/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-outline font-label-md uppercase tracking-wider">
              Active Split Schedules
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
              pie_chart
            </span>
          </div>
          <div className="font-display-lg text-display-lg text-on-surface mb-1">
            {activeSplitsCount} Active
          </div>
          <div className="text-on-surface-variant text-body-md">
            customized split funding
          </div>
        </div>
      </div>

      {/* Row 2: Main Lists */}
      <div className="grid grid-cols-12 gap-8">
        {/* Active Recurring Payments */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Schedules
            </h2>
            <button
              onClick={onCreateNew}
              className="bg-primary text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-label-md hover:bg-primary/90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Create Recurring Payment
            </button>
          </div>
          <PaymentsTable
            schedules={schedules}
            accounts={accounts}
            onEdit={onEdit}
            onDelete={handleDeleteSchedule}
            onExecute={handleExecuteSchedule}
          />
        </div>

        {/* Linked Funding Accounts */}
        <div className="col-span-12 xl:col-span-4">
          <LinkedAccountsList
            accounts={accounts}
            onLinkAccount={handleLinkAccount}
            onUnlinkAccount={handleUnlinkAccount}
          />
        </div>
      </div>

      {/* Row 3: Transaction History */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Recent Transactions History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider border-b border-outline-variant">
                  ID
                </th>
                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider border-b border-outline-variant">
                  Date
                </th>
                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider border-b border-outline-variant">
                  Payee
                </th>
                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider border-b border-outline-variant">
                  Total Amount
                </th>
                <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider border-b border-outline-variant">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="px-6 py-4 font-label-md text-on-surface-variant">
                  #TXN-9821
                </td>
                <td className="px-6 py-4 text-body-md">Sep 24, 2026</td>
                <td className="px-6 py-4 font-bold text-on-surface">
                  Metropolitan Water
                </td>
                <td className="px-6 py-4 font-bold text-on-surface">$120.00</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[11px] font-bold">
                    SUCCESS
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-surface-bright transition-colors">
                <td className="px-6 py-4 font-label-md text-on-surface-variant">
                  #TXN-9754
                </td>
                <td className="px-6 py-4 text-body-md">Sep 02, 2026</td>
                <td className="px-6 py-4 font-bold text-on-surface">
                  Apex Energy
                </td>
                <td className="px-6 py-4 font-bold text-on-surface">$350.00</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[11px] font-bold">
                    SUCCESS
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
