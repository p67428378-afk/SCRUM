import React, { useState } from "react";
import { authService } from "../../services/api";

const MFAForm = ({ userId, username, onVerificationSuccess, onCancel }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.verifyMfa({ user_id: userId, code });
      onVerificationSuccess(data);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Invalid or expired MFA code.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant w-full max-w-md p-xl shadow-lg">
      <div className="text-center mb-xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-xs">
          Security Verification
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          A 6-digit multi-factor authentication code has been sent to your
          registered device/email for{" "}
          <span className="font-semibold">{username}</span>.
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

      <form className="space-y-lg" onSubmit={handleSubmit}>
        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="mfa-code"
          >
            MFA Code
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-lg">
                security
              </span>
            </div>
            <input
              className="block w-full pl-xl pr-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none text-center tracking-widest font-bold"
              id="mfa-code"
              name="mfa-code"
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
        </div>

        <div className="flex space-x-md">
          <button
            className="w-1/2 flex justify-center items-center py-md px-md border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors focus:outline-none"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="w-1/2 flex justify-center items-center py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>

      <div className="mt-md p-sm bg-surface-container rounded text-center text-xs text-on-surface-variant border border-outline-variant">
        <span className="font-semibold">Tip:</span> Check the backend logs or
        audit trail for the generated MFA code.
      </div>
    </div>
  );
};

export default MFAForm;
