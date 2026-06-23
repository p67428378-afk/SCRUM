import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(
        email,
        password,
        mfaRequired ? mfaCode : null,
      );
      if (data.mfa_required) {
        setMfaRequired(true);
        setLoading(false);
      } else {
        onLoginSuccess();
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials or MFA code");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-container-high border border-outline-variant rounded-xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <span
            className="material-symbols-outlined text-primary text-[48px] mb-2"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Apex University
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Academic Portal Login
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-body-md flex items-center gap-2"
            role="alert"
          >
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!mfaRequired ? (
            <>
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30"
                  placeholder="student@apex.edu"
                />
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface-variant mb-2"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30"
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <div>
              <label
                className="block font-label-md text-label-md text-on-surface-variant mb-2"
                htmlFor="mfaCode"
              >
                MFA Code
              </label>
              <input
                id="mfaCode"
                type="text"
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-on-surface font-body-md rounded-lg py-2.5 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant/30 text-center tracking-widest font-bold text-lg"
                placeholder="000000"
                maxLength={6}
              />
              <p className="mt-2 text-xs text-on-surface-variant text-center">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? "Processing..."
              : mfaRequired
                ? "Verify & Login"
                : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
