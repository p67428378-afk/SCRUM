import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/api";
import AccountCard from "../components/dashboard/AccountCard";
import QuickTransfer from "../components/dashboard/QuickTransfer";
import RecentActivity from "../components/dashboard/RecentActivity";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

export default function DashboardPage({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Open Account Modal State
  const [showOpenAccountModal, setShowOpenAccountModal] = useState(false);
  const [newAccountType, setNewAccountType] = useState("Checking");
  const [initialDeposit, setInitialDeposit] = useState("0.00");
  const [openingAccount, setOpeningAccount] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchData = async () => {
    try {
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);

      if (accountsData.length > 0) {
        // Fetch transactions for the first account as recent activity
        const txData = await accountService.getTransactions(
          accountsData[0].id,
          { limit: 5 },
        );
        setTransactions(txData.transactions);
      }
    } catch (err) {
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setModalError("");
    setOpeningAccount(true);

    const deposit = parseFloat(initialDeposit);
    if (isNaN(deposit) || deposit < 0) {
      setModalError("Please enter a valid initial deposit.");
      setOpeningAccount(false);
      return;
    }

    try {
      await accountService.openAccount({
        account_type: newAccountType,
        initial_deposit: deposit,
      });
      setShowOpenAccountModal(false);
      setInitialDeposit("0.00");
      setNewAccountType("Checking");
      fetchData();
    } catch (err) {
      setModalError(
        err.response?.data?.detail || "Failed to open new account.",
      );
    } finally {
      setOpeningAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-on-surface-variant">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-1">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-sm text-on-surface-variant">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setShowOpenAccountModal(true)} variant="primary">
          Open New Account
        </Button>
      </div>

      {error && (
        <div
          className="p-4 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            account={acc}
            onViewDetails={() => navigate(`/accounts?id=${acc.id}`)}
            onTransfer={() => navigate("/transfers")}
          />
        ))}
      </div>

      {/* Lower Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <QuickTransfer accounts={accounts} onTransferSuccess={fetchData} />
        </div>
        <div className="lg:col-span-4">
          <RecentActivity transactions={transactions} />
        </div>
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={showOpenAccountModal}
        onClose={() => setShowOpenAccountModal(false)}
        title="Open New Account"
      >
        <form onSubmit={handleOpenAccount} className="space-y-4">
          {modalError && (
            <div
              className="p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
              role="alert"
            >
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Account Type
            </label>
            <select
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="Checking">Checking Account</option>
              <option value="Savings">Savings Account</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Initial Deposit ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.00"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowOpenAccountModal(false)}
              disabled={openingAccount}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={openingAccount}>
              {openingAccount ? "Opening..." : "Open Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
