import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import {
  UserPlus,
  AlertCircle,
  CheckCircle,
  Mail,
  Lock,
  User,
  Shield,
} from "lucide-react";

export default function RegisterPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "seller",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register(formData);
      // Auto login after registration
      const loginData = await authService.login(
        formData.email,
        formData.password,
      );
      if (onLoginSuccess) onLoginSuccess(loginData.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Email may already be registered.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-12 p-6 sm:p-8 bg-white rounded-2xl border border-[#e3e8f0] shadow-sm space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-textPrimary">
          Create an Account
        </h1>
        <p className="text-xs text-textMuted">
          Join Paws & Homes as a buyer or certified seller
        </p>
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
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMuted mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMuted mb-1">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="password"
              name="password"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 bg-[#f2f5fa] border border-[#e3e8f0] rounded-lg text-xs focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-textMuted mb-1">
            Account Role
          </label>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label
              className={`flex items-center justify-center p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                formData.role === "seller"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#e3e8f0] text-textMuted"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="seller"
                checked={formData.role === "seller"}
                onChange={handleChange}
                className="sr-only"
              />
              <span>Dog Seller</span>
            </label>
            <label
              className={`flex items-center justify-center p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition ${
                formData.role === "buyer"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-[#e3e8f0] text-textMuted"
              }`}
            >
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={formData.role === "buyer"}
                onChange={handleChange}
                className="sr-only"
              />
              <span>Dog Buyer</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register & Continue"}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-[#e3e8f0] text-xs text-textMuted">
        <span>Already have an account? </span>
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
