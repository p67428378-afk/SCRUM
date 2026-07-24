import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { authService } from "../services/api";
import OtpInput from "../components/common/OtpInput";
import Button from "../components/common/Button";

export const MfaPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mfaSessionId, mfaMethods, username } = location.state || {};

  const [selectedMethod, setSelectedMethod] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  useEffect(() => {
    if (!mfaSessionId) {
      navigate("/login");
      return;
    }
    if (mfaMethods && mfaMethods.length > 0) {
      setSelectedMethod(mfaMethods[0]);
    }
  }, [mfaSessionId, mfaMethods, navigate]);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (code.length < 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await authService.verifyMfa(mfaSessionId, selectedMethod, code);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await authService.resendMfa(mfaSessionId, selectedMethod);
      setCooldown(res.cooldown_seconds || 60);
      setRemainingAttempts(res.remaining_attempts);
      setSuccessMessage(
        res.message || "Verification code resent successfully.",
      );
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to resend verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "email":
        return <Mail className="w-5 h-5" />;
      case "sms":
        return <MessageSquare className="w-5 h-5" />;
      case "totp":
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  if (!mfaSessionId) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-on-surface p-4">
      <main className="flex-grow flex items-center justify-center w-full max-w-5xl relative z-10">
        <div className="w-full max-w-[480px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
          {/* Back to Login */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface text-center mb-1">
              Two-Factor Verification
            </h1>
            <p className="text-sm text-on-surface-variant text-center">
              Select a verification method and enter the code sent to you.
            </p>
          </div>

          {/* Bypass Code Note */}
          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 text-center">
            For testing, use bypass code:{" "}
            <strong className="text-white">000000</strong>
          </div>

          {/* Method Selection */}
          {mfaMethods && mfaMethods.length > 1 && (
            <div className="mb-6">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-3">
                Choose Verification Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {mfaMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(method);
                      setCode("");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                      selectedMethod === method
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-900 border-slate-700 text-on-surface-variant hover:border-slate-600 hover:text-on-surface"
                    }`}
                  >
                    {getMethodIcon(method)}
                    <span className="capitalize">{method}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">
                error
              </span>
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">
                check_circle
              </span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <label className="text-sm font-semibold text-on-surface-variant text-center">
                Enter the 6-digit code sent via{" "}
                <span className="capitalize text-indigo-400 font-bold">
                  {selectedMethod}
                </span>
              </label>
              <OtpInput value={code} onChange={setCode} disabled={loading} />
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loading || code.length < 6}
                className="w-full py-3"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              {/* Resend & Cooldown */}
              <div className="flex justify-between items-center text-xs text-on-surface-variant px-1">
                <span>
                  Remaining attempts:{" "}
                  <strong className="text-on-surface">
                    {remainingAttempts}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="w-full max-w-[480px] mx-auto mt-8 text-center pb-8 z-10 relative">
        <p className="text-xs text-on-surface-variant opacity-70">
          Protected by multi-layer rate limiting and AES-256 encryption. Your IP
          address (203.0.113.45) is logged for security auditing.
        </p>
      </footer>
    </div>
  );
};

export default MfaPage;
