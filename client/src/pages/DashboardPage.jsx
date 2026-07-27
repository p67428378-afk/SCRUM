import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { accountService } from "../services/api";
import AccountCard from "../components/dashboard/AccountCard";
import QuickTransfer from "../components/dashboard/QuickTransfer";
import RecentActivity from "../components/dashboard/RecentActivity";

export default function DashboardPage({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    </div>
  );
}
