import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sofa, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/catalog");
    } catch (err) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-borderline rounded-2xl p-8 max-w-md w-full shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mx-auto shadow">
            <Sofa className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-textmain">
            Welcome to FurniCraft
          </h1>
          <p className="text-xs text-textmuted">
            Sign in to manage orders, wishlists, and customized furniture.
          </p>
        </div>

        {/* Test Credentials Helper Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Pre-Seeded Demo Test Accounts:</span>
          </div>
          <div className="flex justify-between items-center bg-white/80 p-2 rounded border border-emerald-100">
            <div>
              <span className="font-semibold block">Customer Account</span>
              <span className="font-mono text-[11px] text-emerald-700">
                test@example.com / testpassword
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleUseDemo("test@example.com", "testpassword")}
              className="text-[10px] font-bold bg-primary text-white px-2 py-1 rounded hover:bg-primary-hover"
            >
              Fill
            </button>
          </div>
        </div>

        {error && (
          <div
            className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-textmain">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <Mail className="w-4 h-4 text-textmuted absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-textmain">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <Lock className="w-4 h-4 text-textmuted absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.99] transition-all shadow-sm disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-borderline text-xs text-textmuted">
          Don&apos;t have an account yet?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary hover:underline"
          >
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
