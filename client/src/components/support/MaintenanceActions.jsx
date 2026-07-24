import React, { useState } from "react";

export const MaintenanceActions = ({ customer, agentRole, onAction }) => {
  const [loading, setLoading] = useState(false);

  const handleLockToggle = async () => {
    if (agentRole === "view-only") return;
    setLoading(true);
    await onAction("lock_toggle", { is_locked: !customer.is_locked });
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (agentRole === "view-only") return;
    setLoading(true);
    await onAction("reset_password");
    setLoading(false);
  };

  const handleCloseAccount = async () => {
    if (agentRole !== "admin") return;
    if (
      window.confirm(
        "Are you sure you want to permanently close this customer account?",
      )
    ) {
      setLoading(true);
      await onAction("close_account");
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">
        Maintenance Actions
      </h2>
      <div className="space-y-3">
        <button
          onClick={handleLockToggle}
          disabled={loading || agentRole === "view-only"}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
            customer.is_locked
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          } disabled:opacity-50`}
        >
          {customer.is_locked ? "Unlock Account" : "Lock Account"}
        </button>

        <button
          onClick={handleResetPassword}
          disabled={loading || agentRole === "view-only"}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          Force Password Reset
        </button>

        {agentRole === "admin" && (
          <button
            onClick={handleCloseAccount}
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            Close Account (Admin Only)
          </button>
        )}

        {agentRole === "view-only" && (
          <p className="text-xs text-slate-400 text-center mt-2">
            Your view-only role does not permit maintenance actions.
          </p>
        )}
      </div>
    </div>
  );
};

export default MaintenanceActions;
