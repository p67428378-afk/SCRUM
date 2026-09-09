import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Sparkles,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const AuthCard = () => {
  const [activeTab, setActiveTab] = useState("signin"); // 'signin' | 'register'
  const [role, setRole] = useState("patron"); // 'patron' | 'admin'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (targetRole) => {
    if (targetRole === "admin") {
      setEmail("admin@example.com");
      setPassword("adminpassword");
      setRole("admin");
    } else {
      setEmail("test@example.com");
      setPassword("testpassword");
      setRole("patron");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === "signin") {
        const loggedInUser = await login({ email, password });
        setSuccessMsg(`Welcome back, ${loggedInUser.full_name}!`);
        setTimeout(() => {
          if (loggedInUser.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/catalog");
          }
        }, 500);
      } else {
        if (!fullName.trim()) {
          setErrorMsg("Full name is required for registration.");
          setLoading(false);
          return;
        }
        const newUser = await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        });
        setSuccessMsg(`Account created successfully for ${newUser.full_name}!`);
        setTimeout(() => {
          if (newUser.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/catalog");
          }
        }, 500);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Authentication failed. Please check credentials or email uniqueness.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("signin");
            setErrorMsg(null);
          }}
          className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === "signin"
              ? "border-[#122338] text-[#122338] bg-gray-50/50"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("register");
            setErrorMsg(null);
          }}
          className={`flex-1 py-4 text-center font-medium text-sm flex items-center justify-center space-x-2 border-b-2 transition ${
            activeTab === "register"
              ? "border-[#122338] text-[#122338] bg-gray-50/50"
              : "border-transparent text-gray-500 hover:text-[#111c2d]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Account</span>
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {/* Quick Demo Credentials Bar */}
        <div className="mb-6 p-3 bg-[#122338]/5 rounded-xl border border-[#122338]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#122338] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#0d6847]" />
              Quick Demo Accounts
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("patron")}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 transition text-center"
            >
              Patron Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="flex-1 py-1 px-2 text-[11px] font-medium bg-white hover:bg-gray-100 border border-gray-200 rounded text-gray-700 transition text-center"
            >
              Admin Demo
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center">
            Test account:{" "}
            <code className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">
              test@example.com
            </code>{" "}
            /{" "}
            <code className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">
              testpassword
            </code>
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#ba1a1a] flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#0d6847] flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name for Registration */}
          {activeTab === "register" && (
            <div>
              <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required={activeTab === "register"}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Role selector for registration */}
          {activeTab === "register" && (
            <div>
              <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
                Account Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("patron")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    role === "patron"
                      ? "bg-[#122338] text-white border-[#122338]"
                      : "bg-gray-50 text-[#566070] border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Patron</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                    role === "admin"
                      ? "bg-[#122338] text-white border-[#122338]"
                      : "bg-gray-50 text-[#566070] border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrator</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#122338] hover:bg-[#1f3552] text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#122338] transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>
              {loading
                ? "Authenticating..."
                : activeTab === "signin"
                  ? "Sign In to Account"
                  : "Create Library Account"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
