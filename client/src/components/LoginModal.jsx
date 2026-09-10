import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, LogIn, Key, UserCheck, ShieldCheck } from "lucide-react";

export const LoginModal = ({ isOpen, onClose }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message || "Authentication failed. Please check credentials.",
      );
    }
  };

  const handleQuickFill = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sign In to BiblioCentral
            </h2>
            <p className="text-xs text-slate-500">
              Access your library account or staff console
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. test@example.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F46E5] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm shadow-indigo-200"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            Quick-Login Test Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                handleQuickFill("test@example.com", "testpassword")
              }
              className="px-2.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-indigo-500" /> Patron
              </div>
              <div className="text-[10px] text-slate-500">test@example.com</div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickFill("staff@example.com", "adminpassword")
              }
              className="px-2.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-500" /> Staff
              </div>
              <div className="text-[10px] text-slate-500">
                staff@example.com
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickFill("admin@example.com", "adminpassword")
              }
              className="px-2.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-left transition-colors"
            >
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-rose-500" /> Admin
              </div>
              <div className="text-[10px] text-slate-500">
                admin@example.com
              </div>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Test account: test@example.com / testpassword
          </p>
        </div>
      </div>
    </div>
  );
};
