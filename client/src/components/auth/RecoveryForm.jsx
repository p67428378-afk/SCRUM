import React, { useState } from "react";
import { authService } from "../../services/api";

const RecoveryForm = ({ onRecoverySuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState(1); // 1: Initiate, 2: Complete
  const [username, setUsername] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pw) => {
    if (pw.length < 12) return "Password must be at least 12 characters long.";
    if (!/[A-Z]/.test(pw))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
      return "Password must contain at least one special character.";
    return null;
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(false);

    if (!username) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = { username };
      if (securityAnswer) {
        payload.security_answer = securityAnswer;
      }
      const data = await authService.recoverInitiate(payload);
      setSuccess(data.message || "Recovery code sent successfully.");
      setStep(2);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to initiate recovery.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(false);

    if (!emailCode || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const pwError = validatePassword(newPassword);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username,
        email_code: emailCode,
        new_password: newPassword,
      };
      const data = await authService.recoverComplete(payload);
      setSuccess(
        data.message || "Password reset successfully! Redirecting to login...",
      );
      setTimeout(() => {
        onRecoverySuccess();
      }, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Failed to complete recovery.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant w-full max-w-md p-xl shadow-lg">
      <div className="text-center mb-xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-xs">
          Reset Password
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {step === 1
            ? "Enter your username and security answer to receive a recovery code."
            : "Enter the recovery code and your new password."}
        </p>
      </div>

      {error && (
        <div
          className="mb-lg p-md bg-error-container text-on-error-container rounded border border-error text-body-sm font-medium"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="mb-lg p-md bg-secondary-container text-on-secondary-container rounded border border-secondary text-body-sm font-medium"
          role="alert"
        >
          {success}
        </div>
      )}

      {step === 1 ? (
        <form className="space-y-lg" onSubmit={handleInitiate}>
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="rec-username"
            >
              Username / Email
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="rec-username"
              name="rec-username"
              type="email"
              placeholder="name@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="rec-security-answer"
            >
              Security Answer
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="rec-security-answer"
              name="rec-security-answer"
              type="text"
              placeholder="Your security answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-md">
            <button
              className="w-1/2 flex justify-center items-center py-md px-md border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors focus:outline-none"
              type="button"
              onClick={onNavigateToLogin}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="w-1/2 flex justify-center items-center py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code"}
            </button>
          </div>
        </form>
      ) : (
        <form className="space-y-lg" onSubmit={handleComplete}>
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="email-code"
            >
              Recovery Code
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-center tracking-widest font-bold"
              id="email-code"
              name="email-code"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>

          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="new-password"
              name="new-password"
              type="password"
              placeholder="Min 12 chars"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="confirm-new-password"
            >
              Confirm New Password
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="confirm-new-password"
              name="confirm-new-password"
              type="password"
              placeholder="Confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-md">
            <button
              className="w-1/2 flex justify-center items-center py-md px-md border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors focus:outline-none"
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
            <button
              className="w-1/2 flex justify-center items-center py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Remember your password?{" "}
          <button
            className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors focus:outline-none"
            onClick={onNavigateToLogin}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RecoveryForm;
