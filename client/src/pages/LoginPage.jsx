import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, ArrowRight, User, Lock } from "lucide-react";
import { authService } from "../services/api";
import BotDefense from "../components/security/BotDefense";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [showPassword, setShowPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }
    if (!isBotVerified) {
      setError("Please complete the device security verification.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await authService.login(username, password);
      // Redirect to MFA page with session details
      navigate("/mfa", {
        state: {
          mfaSessionId: res.mfa_session_id,
          mfaMethods: res.mfa_methods,
          username,
        },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-on-surface p-4">
      <main className="flex-grow flex items-center justify-center w-full max-w-5xl relative z-10">
        <div className="w-full max-w-[480px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              alt="ApexSecure Bank Logo"
              className="w-16 h-16 mb-4 rounded-lg object-contain bg-slate-900 p-2"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFXmqNm8X37IeQkVmFucBjhiee6pIbrbqkNuNNy-440jniaKIxQp2KhyHJPf4sLZf15lZUgOa-eYeuNo3CgqysbfDhTMBTB8zHGCV7p4PKupqho8PKLD9yuZC_mqu-6y8q1hKuPmjn5_r-9ohg2OnJuX4ptCcPT3rZpTNUCCwfnRXXkzhFXasbzE0pJ1GLCOEQsf_Y5rWU2i3X-hJzjpytI0uviyZ3FYyCgaPBrsCKx5h8YlS50wO4LNCTM5SUqi-MaMSfLiQhzkGo"
            />
            <h1 className="text-2xl font-bold text-on-surface text-center mb-1">
              Sign in to your account
            </h1>
            <p className="text-sm text-on-surface-variant text-center">
              Secure Retail Banking Portal
            </p>
          </div>

          {/* Test Credentials Note */}
          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 text-center">
            Test account:{" "}
            <strong className="text-white">test@example.com</strong> /{" "}
            <strong className="text-white">testpassword</strong>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-on-surface-variant"
                htmlFor="username"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold text-on-surface-variant"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-on-surface focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bot Defense */}
            <BotDefense onVerify={setIsBotVerified} />

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition-colors duration-150 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Continue to MFA"}
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-center px-2">
                <a
                  className="text-xs text-on-surface-variant hover:text-indigo-500 transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
                <a
                  className="text-xs text-on-surface-variant hover:text-indigo-500 transition-colors"
                  href="#"
                >
                  Forgot Username?
                </a>
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

export default LoginPage;
