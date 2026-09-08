import React, { useState } from "react";
import PropTypes from "prop-types";
import { X, Lock, Mail, User, BookOpen, AlertCircle } from "lucide-react";
import { authService } from "../../services/api";

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("Alex Morgan");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let data;
      if (mode === "login") {
        data = await authService.login(email, password);
      } else {
        data = await authService.register(email, password, fullName);
      }
      if (onSuccess) {
        onSuccess(data.user || authService.getStoredUser());
      }
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (mode === "login"
          ? "Failed to sign in. Please verify credentials."
          : "Registration failed. Try again.");
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError("");
    if (newMode === "login") {
      setEmail("test@example.com");
      setPassword("testpassword");
    } else {
      setEmail("");
      setPassword("");
      setFullName("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="bg-brand-950 text-white p-6 flex justify-between items-center relative">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-accent" />
            <h2
              id="auth-modal-title"
              className="text-xl font-serif font-bold text-white"
            >
              {mode === "login"
                ? "Welcome Back to Book Haven"
                : "Create an Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex border-b border-slate-200 mb-6">
            <button
              type="button"
              className={`flex-1 py-2 font-medium text-sm border-b-2 text-center transition-colors ${
                mode === "login"
                  ? "border-brand-950 text-brand-950 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => handleModeSwitch("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`flex-1 py-2 font-medium text-sm border-b-2 text-center transition-colors ${
                mode === "register"
                  ? "border-brand-950 text-brand-950 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => handleModeSwitch("register")}
            >
              Register
            </button>
          </div>

          {/* Test credentials banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-900">
            <p className="font-semibold text-amber-950 mb-1">
              🔑 Test Account Credentials:
            </p>
            <p>
              <strong>Customer:</strong>{" "}
              <span className="font-mono">test@example.com</span> /{" "}
              <span className="font-mono">testpassword</span>
            </p>
            <p>
              <strong>Admin:</strong>{" "}
              <span className="font-mono">admin@example.com</span> /{" "}
              <span className="font-mono">adminpassword</span>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 uppercase mb-1"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-950 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 uppercase mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-950 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 uppercase mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-950 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent hover:bg-accent-hover text-slate-900 font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 mt-6"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  initialMode: PropTypes.oneOf(["login", "register"]),
};
