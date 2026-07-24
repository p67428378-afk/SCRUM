import React, { useState } from "react";
import CustomerProfileCard from "../components/support/CustomerProfileCard";
import MaintenanceActions from "../components/support/MaintenanceActions";

export const SupportConsolePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customer, setCustomer] = useState(null);
  const [agentRole, setAgentRole] = useState("view-only"); // view-only, maintenance, admin
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setError("");
    setSuccess("");

    // Simulate customer lookup
    setTimeout(() => {
      if (
        searchQuery.toLowerCase().includes("alex") ||
        searchQuery.toLowerCase().includes("test")
      ) {
        const mockCustomer = {
          id: "11111111-2222-3333-4444-555555555555",
          username: "alex_mercer",
          email: "test@example.com",
          phone_number: "+1 (555) 019-2834",
          role: "customer",
          is_locked: false,
        };
        setCustomer(mockCustomer);
        addLog(
          "CUSTOMER_LOOKUP",
          `Looked up customer profile for ${mockCustomer.username}`,
        );
      } else {
        setError("No customer found matching that query.");
        setCustomer(null);
      }
      setLoading(false);
    }, 500);
  };

  const handleMaintenanceAction = async (actionType, payload = {}) => {
    setSuccess("");
    setError("");

    // Simulate action execution and logging
    setTimeout(() => {
      if (actionType === "lock_toggle") {
        const updated = { ...customer, is_locked: payload.is_locked };
        setCustomer(updated);
        setSuccess(
          `Customer account successfully ${payload.is_locked ? "locked" : "unlocked"}.`,
        );
        addLog(
          "ACCOUNT_LOCK_TOGGLE",
          `${payload.is_locked ? "Locked" : "Unlocked"} account for ${customer.username}`,
        );
      } else if (actionType === "reset_password") {
        setSuccess("Password reset link successfully sent to customer email.");
        addLog(
          "PASSWORD_RESET_FORCE",
          `Forced password reset for ${customer.username}`,
        );
      } else if (actionType === "close_account") {
        setSuccess("Customer account successfully closed.");
        addLog("ACCOUNT_CLOSE", `Closed account for ${customer.username}`);
        setCustomer(null);
      }
    }, 500);
  };

  const addLog = (action, details) => {
    const newLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      agent: `agent_${agentRole}`,
      action,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Support Agent Console
          </h1>
          <p className="text-slate-400">
            Look up customer accounts, view transaction history, and perform
            maintenance.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="text-xs font-semibold text-slate-400 uppercase pl-2">
            Agent Role:
          </span>
          <select
            value={agentRole}
            onChange={(e) => setAgentRole(e.target.value)}
            className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="view-only">View-Only Support</option>
            <option value="maintenance">Account Maintenance</option>
            <option value="admin">System Admin</option>
          </select>
        </div>
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

      {/* Search Form */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Search by username, email, or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <CustomerProfileCard customer={customer} />
          <MaintenanceActions
            customer={customer}
            agentRole={agentRole}
            onAction={handleMaintenanceAction}
          />
        </div>

        {/* Right Column: Agent Action Logs */}
        <div className="lg:col-span-8 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Agent Action Audit Trail
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-slate-400 text-sm"
                    >
                      No actions taken in this session.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-medium whitespace-nowrap">
                        {log.agent}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportConsolePage;
