import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import { User, Lock, LogIn, AlertCircle, Info } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      console.error("Login failed", err);
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-[#e3e8f0] p-8 rounded-2xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#171c29]">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#707a8c]">
              Access your orders, cart, and profile details
            </p>
          </div>

          {/* Test Account Info Banner */}
          <div className="bg-[#e0e7ff] border border-[#2663eb]/20 p-3 rounded-xl flex items-start gap-2 text-xs text-[#2663eb]">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Test Account Credentials:</p>
              <p>
                Email:{" "}
                <code className="bg-white px-1 py-0.5 rounded font-mono">
                  test@example.com
                </code>
              </p>
              <p>
                Password:{" "}
                <code className="bg-white px-1 py-0.5 rounded font-mono">
                  testpassword
                </code>
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-[#fee2e2] text-[#db2626] p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
                  required
                />
                <User className="w-4 h-4 text-[#707a8c] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
                  required
                />
                <Lock className="w-4 h-4 text-[#707a8c] absolute left-3 top-2.5" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-xs text-[#707a8c]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#2663eb] font-bold hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
