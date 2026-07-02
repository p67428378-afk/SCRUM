import React, { useState, useEffect } from "react";

export default function OTPVerificationModal({
  onVerify,
  onCancel,
  loading,
  mobileNumber,
}) {
  const [otpCode, setOtpCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit OTP code.");
      return;
    }

    onVerify(otpCode);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-md z-50">
      <div className="bg-surface-container rounded-xl border border-outline-variant p-lg max-w-md w-full shadow-xl space-y-lg">
        <div className="flex justify-between items-center border-b border-outline-variant pb-md">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">
              security
            </span>
            OTP Verification
          </h3>
          <button
            onClick={onCancel}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant">
          We have sent a 6-digit verification code to{" "}
          <span className="text-on-surface font-bold">{mobileNumber}</span>.
          Please enter it below to complete registration.
        </p>

        {error && (
          <div className="p-md bg-error-container/20 border border-error text-error rounded-lg text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-lg">
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-surface-variant block text-center">
              Enter 6-Digit OTP
            </label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 text-center font-code-md text-2xl tracking-[0.5em] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              type="text"
              maxLength="6"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center text-body-sm text-on-surface-variant">
            <span>
              {timer > 0 ? (
                `Resend code in ${timer}s`
              ) : (
                <button
                  type="button"
                  onClick={() => setTimer(60)}
                  className="text-primary hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </span>
            <span className="italic">Test OTP: 123456</span>
          </div>

          <div className="flex gap-md pt-md">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-surface-container-high text-on-surface hover:bg-surface-variant font-label-md text-label-md py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                verified
              </span>
              {loading ? "Verifying..." : "Verify & Activate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
