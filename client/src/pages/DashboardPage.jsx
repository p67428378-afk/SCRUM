import React, { useState, useEffect } from "react";
import api from "../services/api";
import AccountCard from "../components/dashboard/AccountCard";
import QuickActions from "../components/dashboard/QuickActions";
import { useNavigate } from "react-router-dom";

export const DashboardPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/api/v1/accounts");
      setAccounts(response.data);
      if (response.data.length > 0) {
        setSelectedAccount(response.data[0]);
        fetchTransactions(response.data[0].id);
      }
    } catch (err) {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    try {
      const response = await api.get(
        `/api/v1/accounts/${accountId}/transactions`,
      );
      setTransactions(response.data.items);
    } catch (err) {
      setError("Failed to load transactions");
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    fetchTransactions(account.id);
  };

  const handleQuickAction = (actionId) => {
    if (actionId === "transfer" || actionId === "pay_bill") {
      navigate("/transfers");
    } else if (actionId === "statements") {
      navigate("/statements");
    } else if (actionId === "new_account") {
      navigate("/new-account");
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
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
      {/* Dashboard Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Overview</h1>
          <p className="text-slate-400">
            Welcome back. Here is what is happening with your accounts today.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <AccountCard
            key={acc.id}
            account={acc}
            onSelect={handleAccountSelect}
          />
        ))}
      </div>

      {/* Dashboard Grid: Content & Quick Actions */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Activity Table */}
        <div className="col-span-12 lg:col-span-8 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Recent Activity{" "}
              {selectedAccount && `(${selectedAccount.account_type})`}
            </h2>
            <button
              onClick={() => navigate("/transactions")}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold flex items-center gap-1"
            >
              View All{" "}
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-slate-400 text-sm"
                    >
                      No recent transactions.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                        {tx.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${
                          tx.type === "debit"
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {tx.type === "debit" ? "-" : "+"}
                        {formatCurrency(tx.amount, selectedAccount?.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <QuickActions onAction={handleQuickAction} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
