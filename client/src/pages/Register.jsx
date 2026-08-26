import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sofa, Lock, Mail, User, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, fullName.trim());
      navigate("/catalog");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed. Email may already be in use.",
      );
    } finally {
      setIsLoading(false);
    }
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
            Create Your Account
          </h1>
          <p className="text-xs text-textmuted">
            Join FurniCraft to save customized designs, track orders, and unlock
            member perks.
          </p>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-textmain">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-borderline rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <User className="w-4 h-4 text-textmuted absolute left-3 top-3" />
            </div>
          </div>

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
              Password (min 6 characters)
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
            {isLoading ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-borderline text-xs text-textmuted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
