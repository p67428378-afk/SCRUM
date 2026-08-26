import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { LogIn, AlertCircle, Info, Lock, Mail } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  // Pre-fill test credentials per Constitution & mandatory rules
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      if (onLoginSuccess) onLoginSuccess(data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const msg =
        err.response?.data?.detail ||
        "Invalid email or password. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16 p-6 sm:p-8 bg-white rounded-2xl border border-[#e3e8f0] shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-textPrimary">Welcome Back</h1>
        <p className="text-xs text-textMuted">
          Log in to manage your dog listings and inquiries
        </p>
      </div>

      {/* Mandatory Test Credentials Banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Test Account Pre-filled:</p>
          <p className="font-mono text-[11px] mt-0.5">
            Test account: <span className="font-bold">test@example.com</span> /{" "}
            <span className="font-bold">testpassword</span>
          </p>
        </div>
      </div>

      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-textMuted mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMuted mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-[#e3e8f0] text-xs text-textMuted">
        <span>Don't have an account yet? </span>
        <Link to="/register" className="text-primary font-bold hover:underline">
          Register Here
        </Link>
      </div>
    </div>
  );
}
