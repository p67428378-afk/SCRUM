import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import Card from "../components/common/Card";
import {
  User,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  // Pre-fill test credentials as required by standards
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegistering) {
        await registerUser({
          email,
          password,
          full_name: fullName,
          role,
        });
        setMessage("Account registered successfully! Logging you in...");
        const loginData = await loginUser(email, password);
        if (onLoginSuccess) onLoginSuccess(loginData.user);
        navigate("/dashboard");
      } else {
        const loginData = await loginUser(email, password);
        if (onLoginSuccess) onLoginSuccess(loginData.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.detail ||
          "Authentication failed. Please verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-4">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <span className="text-4xl block">🥐</span>
          <h2 className="text-2xl font-extrabold text-[#1F1A14]">
            Artisan Bakery POS
          </h2>
          <p className="text-xs text-[#80756B]">
            Sign in to manage sales, orders, recipes, and inventory
          </p>
        </div>

        {/* Test Account Notice (MANDATORY) */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900 flex items-start space-x-2">
          <KeyRound className="w-4 h-4 text-[#D96B1F] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Test Account Credentials:</span>
            <div className="font-mono mt-0.5">
              Email: test@example.com | Password: testpassword
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-base font-bold text-[#1F1A14] border-b border-[#E5DED1] pb-2">
              {isRegistering ? "Create Staff Account" : "Sign In to Terminal"}
            </h3>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#1F9E4D] rounded-md text-xs flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-[#80756B]" />
                  <input
                    type="text"
                    required={isRegistering}
                    placeholder="e.g. Jane Baker"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#80756B]" />
                <input
                  type="email"
                  required
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#80756B]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                >
                  <option value="staff">Staff / Cashier</option>
                  <option value="baker">Kitchen / Baker</option>
                  <option value="manager">Manager / Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#D96B1F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#B85310] transition-colors shadow"
            >
              {loading
                ? "Processing..."
                : isRegistering
                  ? "Register & Login"
                  : "Sign In"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                  setMessage(null);
                }}
                className="text-xs text-[#D96B1F] hover:underline font-medium"
              >
                {isRegistering
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Create Staff Account"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
