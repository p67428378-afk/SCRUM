import React, { useState, useEffect } from "react";
import { adminService } from "../services/api";
import CustomerProfile from "../components/admin/CustomerProfile";
import AccountsBalances from "../components/admin/AccountsBalances";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import Button from "../components/common/Button";

export default function AdminSupportPage() {
  const [userId, setUserId] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [logEventType, setLogEventType] = useState("");

  const handleSearchCustomer = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setLoadingCustomer(true);
    setError("");
    setCustomerData(null);

    try {
      const data = await adminService.getUser(userId);
      setCustomerData(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "User not found or not authorized.",
      );
    } finally {
      setLoadingCustomer(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const params = {
        event_type: logEventType || undefined,
        limit: 50,
      };
      const data = await adminService.getLogs(params);
      setLogs(data.logs);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logEventType]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-1">
          Admin Support Portal
        </h1>
        <p className="text-sm text-on-surface-variant">
          Customer troubleshooting, account inquiry, and audit logs
        </p>
      </div>

      {error && (
        <div
          className="p-4 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Customer Inquiry Section */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-on-surface">Customer Inquiry</h2>
        <form
          onSubmit={handleSearchCustomer}
          className="flex gap-4 items-end max-w-xl"
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Search by User ID (UUID)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo font-mono text-sm"
              placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="h-[42px]"
            disabled={loadingCustomer}
          >
            {loadingCustomer ? "Searching..." : "Search"}
          </Button>
        </form>

        {customerData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <CustomerProfile profile={customerData} />
            <AccountsBalances accounts={customerData.accounts} />
          </div>
        )}
      </div>

      {/* Audit Logs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">
            System Audit Logs
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-on-surface-variant">
              Filter Event
            </label>
            <select
              value={logEventType}
              onChange={(e) => setLogEventType(e.target.value)}
              className="bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-1.5 px-3 text-sm focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="">All Events</option>
              <option value="USER_REGISTRATION">User Registration</option>
              <option value="LOGIN_INITIATED">Login Initiated</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="MFA_CODE_SENT">MFA Code Sent</option>
              <option value="MFA_VERIFICATION_SUCCESS">MFA Success</option>
              <option value="MFA_VERIFICATION_FAILED">MFA Failed</option>
              <option value="TRANSFER_INITIATED">Transfer Initiated</option>
              <option value="USER_LOGOUT">User Logout</option>
            </select>
          </div>
        </div>

        <AuditLogsTable logs={logs} loading={loadingLogs} />
      </div>
    </div>
  );
}
