import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Lock, Mail, AlertCircle, Info } from "lucide-react";
import { loginUser } from "../services/api";

export default function LoginPage({ onUserChange }) {
  const navigate = useNavigate();
  // Mandatory Test Credentials pre-filled for instant testing
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      if (res && res.user) {
        if (onUserChange) onUserChange(res.user);
        navigate("/");
      } else {
        throw new Error("Login failed: invalid response structure");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Invalid email or password.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Log In to Bandra Hotel
          </h1>
          <p className="text-xs text-gray-500">
            Access your food delivery portal & order history
          </p>
        </div>

        {/* Mandatory Test Credentials Banner */}
        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block mb-0.5">
              Test Account Credentials:
            </span>
            <p className="font-mono text-[11px] bg-white/60 p-1.5 rounded border border-amber-200/50 mt-1">
              Email: <strong>test@example.com</strong>
              <br />
              Password: <strong>testpassword</strong>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition shadow-md ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Authenticating..." : "Log In to Account"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600">
          Don't have an account yet?{" "}
          <Link
            to="/register"
            className="font-bold text-amber-700 hover:underline"
          >
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
