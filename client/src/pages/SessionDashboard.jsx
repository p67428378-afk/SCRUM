import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  UserPlus,
  UserCheck,
  DollarSign,
} from "lucide-react";
import { sessionService } from "../services/api";
import SessionsTable from "../components/security/SessionsTable";
import StepUpModal from "../components/security/StepUpModal";
import Button from "../components/common/Button";

export const SessionDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  // Step-up state
  const [isStepUpOpen, setIsStepUpOpen] = useState(false);
  const [stepUpAction, setStepUpAction] = useState("add_payee");
  const [stepUpAmount, setStepUpAmount] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await sessionService.listSessions();
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load active sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    setIsRevoking(true);
    setError("");
    setSuccessMessage("");
    try {
      await sessionService.revokeSession(sessionId);
      setSuccessMessage("Session revoked successfully.");
      await fetchSessions();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to revoke session.");
    } finally {
      setIsRevoking(false);
    }
  };

  const triggerStepUp = (actionType, amount = null) => {
    setStepUpAction(actionType);
    setStepUpAmount(amount);
    setIsStepUpOpen(true);
  };

  const handleStepUpSuccess = () => {
    setSuccessMessage(
      `Step-up verification for "${stepUpAction.replace("_", " ")}" succeeded!`,
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">
            Security & Session Management
          </h2>
          <p className="text-sm text-on-surface-variant">
            Monitor active sessions, revoke unauthorized access, and perform
            high-risk actions securely.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">
            Multi-Factor Auth Active
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400">error</span>
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">
            check_circle
          </span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* High-Risk Actions Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-400" />
          High-Risk Actions (Step-Up Authentication)
        </h3>
        <p className="text-sm text-on-surface-variant">
          These actions require step-up authentication to verify your identity
          before proceeding.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add Payee */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between gap-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg w-fit">
                <UserPlus className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-on-surface">Add New Payee</h4>
              <p className="text-xs text-on-surface-variant">
                Register a new external payee for ACH or bill payments.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => triggerStepUp("add_payee")}
            >
              Add Payee
            </Button>
          </div>

          {/* Change Contact Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between gap-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg w-fit">
                <UserCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-on-surface">
                Update Contact Info
              </h4>
              <p className="text-xs text-on-surface-variant">
                Change your registered email, phone number, or physical address.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => triggerStepUp("change_contact")}
            >
              Update Info
            </Button>
          </div>

          {/* Large Transfer */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between gap-4 hover:border-slate-600 transition-colors">
            <div className="space-y-2">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg w-fit">
                <DollarSign className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-semibold text-on-surface">
                Large Money Transfer
              </h4>
              <p className="text-xs text-on-surface-variant">
                Initiate a transfer above the bank-configurable threshold
                ($5,000).
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => triggerStepUp("large_transfer", 7500)}
            >
              Transfer $7,500
            </Button>
          </div>
        </div>
      </section>

      {/* Active Sessions Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Active Sessions
          </h3>
          <Button
            variant="secondary"
            onClick={fetchSessions}
            disabled={loading}
            className="text-xs py-1.5 px-3"
          >
            Refresh
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-on-surface-variant">
              Loading active sessions...
            </p>
          </div>
        ) : (
          <SessionsTable
            sessions={sessions}
            onRevoke={handleRevoke}
            isRevoking={isRevoking}
          />
        )}
      </section>

      {/* Step-Up Modal */}
      <StepUpModal
        isOpen={isStepUpOpen}
        onClose={() => setIsStepUpOpen(false)}
        actionType={stepUpAction}
        amount={stepUpAmount}
        onSuccess={handleStepUpSuccess}
      />
    </div>
  );
};

export default SessionDashboard;
