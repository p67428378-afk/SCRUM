import React, { useState, useEffect } from "react";
import { adminService } from "../services/api";
import CustomerProfile from "../components/admin/CustomerProfile";
import AccountsBalances from "../components/admin/AccountsBalances";
import AuditLogsTable from "../components/admin/AuditLogsTable";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

export default function AdminSupportPage() {
  const [userId, setUserId] = useState("");
  const [customerData, setCustomerData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [logEventType, setLogEventType] = useState("");

  // Modals State
  const [showOpenAccountModal, setShowOpenAccountModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Form States
  const [newAccountType, setNewAccountType] = useState("Checking");
  const [initialDeposit, setInitialDeposit] = useState("0.00");
  const [selectedAccount, setSelectedStatement] = useState(null);
  const [editAccountType, setEditAccountType] = useState("Checking");
  const [editAccountStatus, setEditAccountStatus] = useState("active");
  const [newPassword, setNewPassword] = useState("");
  const [lockTargetStatus, setLockTargetStatus] = useState(true);

  // Loading States for Actions
  const [submitting, setSubmitting] = useState(false);

  const handleSearchCustomer = async (e) => {
    if (e) e.preventDefault();
    if (!userId) return;

    setLoadingCustomer(true);
    setError("");
    setSuccess("");
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

  // Action Handlers
  const handleOpenAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const deposit = parseFloat(initialDeposit);
    if (isNaN(deposit) || deposit < 0) {
      setError("Please enter a valid initial deposit.");
      setSubmitting(false);
      return;
    }

    try {
      await adminService.openAccount({
        user_id: customerData.id,
        account_type: newAccountType,
        initial_deposit: deposit,
      });
      setSuccess("New account opened successfully!");
      setShowOpenAccountModal(false);
      setInitialDeposit("0.00");
      setNewAccountType("Checking");
      // Refresh customer data
      handleSearchCustomer();
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to open account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await adminService.updateAccount(selectedAccount.id, {
        account_type: editAccountType,
        status: editAccountStatus,
      });
      setSuccess("Account updated successfully!");
      setShowEditAccountModal(false);
      // Refresh customer data
      handleSearchCustomer();
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockToggle = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await adminService.lockUser(customerData.id, lockTargetStatus);
      setSuccess(
        `User account ${lockTargetStatus ? "unlocked" : "locked"} successfully!`,
      );
      setShowLockModal(false);
      // Refresh customer data
      handleSearchCustomer();
      fetchLogs();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to update user lock status.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForcePasswordReset = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await adminService.forcePasswordReset(customerData.id, newPassword);
      setSuccess("User password reset successfully!");
      setShowResetPasswordModal(false);
      setNewPassword("");
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

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

      {success && (
        <div className="p-4 bg-brand-emerald/10 border border-brand-emerald text-emerald rounded-lg text-sm">
          {success}
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
            <CustomerProfile
              profile={customerData}
              onLockToggle={(id, isActive) => {
                setLockTargetStatus(!isActive);
                setShowLockModal(true);
              }}
              onForcePasswordReset={() => setShowResetPasswordModal(true)}
            />
            <AccountsBalances
              accounts={customerData.accounts}
              onOpenAccount={() => setShowOpenAccountModal(true)}
              onEditAccount={(acc) => {
                setSelectedStatement(acc);
                setEditAccountType(acc.account_type);
                setEditAccountStatus(acc.status);
                setShowEditAccountModal(true);
              }}
            />
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

      {/* Open Account Modal */}
      <Modal
        isOpen={showOpenAccountModal}
        onClose={() => setShowOpenAccountModal(false)}
        title="Open Account for Customer"
      >
        <form onSubmit={handleOpenAccount} className="space-y-4">
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
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Opening..." : "Open Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        isOpen={showEditAccountModal}
        onClose={() => setShowEditAccountModal(false)}
        title="Edit Customer Account"
      >
        <form onSubmit={handleEditAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Account Type
            </label>
            <select
              value={editAccountType}
              onChange={(e) => setEditAccountType(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="Checking">Checking Account</option>
              <option value="Savings">Savings Account</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Account Status
            </label>
            <select
              value={editAccountStatus}
              onChange={(e) => setEditAccountStatus(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            >
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditAccountModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lock/Unlock User Modal */}
      <Modal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        title={lockTargetStatus ? "Unlock User Account" : "Lock User Account"}
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to {lockTargetStatus ? "unlock" : "lock"} this
            user account?{" "}
            {lockTargetStatus
              ? "They will be able to log in again."
              : "They will be blocked from logging in."}
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLockModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLockToggle}
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : lockTargetStatus
                  ? "Unlock"
                  : "Lock"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Force Password Reset Modal */}
      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Force Password Reset"
      >
        <form onSubmit={handleForcePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
              placeholder="Enter strong new password"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetPasswordModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
