import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { authService } from "../../services/api";

export default function MfaForm({ userId, onVerifySuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const sendCode = async () => {
    setSending(true);
    setError("");
    setMessage("");
    try {
      await authService.sendMfaCode(userId);
      setMessage("MFA code sent successfully to your registered device.");
    } catch (err) {
      setError("Failed to send MFA code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    sendCode();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.verifyMfaCode(userId, code);
      onVerifySuccess(response);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired MFA code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-card rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-on-surface">
          Multi-Factor Authentication
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Enter the 6-digit code sent to your device
        </p>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-brand-emerald/10 border border-brand-emerald text-emerald rounded-lg text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-on-surface-variant mb-1"
            htmlFor="mfa-code"
          >
            Verification Code
          </label>
          <input
            id="mfa-code"
            type="text"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo text-center font-mono text-lg tracking-widest"
            placeholder="123456"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={sendCode}
          disabled={sending}
          className="text-sm text-brand-indigo hover:underline disabled:opacity-50"
        >
          {sending ? "Sending..." : "Resend Code"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-brand-indigo/5 border border-brand-indigo/20 rounded-lg text-xs text-on-surface-variant">
        <p className="font-semibold text-on-surface mb-1">Testing Tip:</p>
        <p>
          For test accounts (<span className="font-mono">testuser</span> /{" "}
          <span className="font-mono">adminuser</span>), the MFA code is always{" "}
          <span className="font-mono font-bold text-primary">123456</span>.
        </p>
      </div>
    </div>
  );
}
