import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import { User, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ full_name: fullName, email, password });
      navigate("/");
    } catch (err) {
      console.error("Registration failed", err);
      setError(err.message || "Registration failed. Try a different email.");
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
              Create an Account
            </h1>
            <p className="text-xs text-[#707a8c]">
              Join THREAD &amp; STYLE to manage orders and track shipments
            </p>
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
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
                  required
                />
                <User className="w-4 h-4 text-[#707a8c] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
                  required
                />
                <Mail className="w-4 h-4 text-[#707a8c] absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
                  minLength={8}
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
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>

          <div className="text-center text-xs text-[#707a8c]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#2663eb] font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
