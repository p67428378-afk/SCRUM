import React, { useState } from "react";
import { authAPI } from "../services/api";
import {
  User,
  Mail,
  Phone,
  Lock,
  Globe,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DevoteePortal({ user, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");

  // Register state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLanguage, setRegLanguage] = useState("Hindi");
  const [regAddress, setRegAddress] = useState("");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authAPI.login({ identifier, password });
      localStorage.setItem("token", data.access_token);
      onLoginSuccess(data.user, data.access_token);
      setSuccessMsg("Logged in successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Login failed. Please check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        full_name: regFullName,
        email: regEmail || null,
        phone: regPhone || null,
        password: regPassword,
        preferred_language: regLanguage,
        address: regAddress || null,
      };
      const data = await authAPI.register(payload);
      localStorage.setItem("token", data.access_token);
      onLoginSuccess(data.user, data.access_token);
      setSuccessMsg("Registration successful! Welcome devotee.");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Please verify input.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (role) => {
    if (role === "admin") {
      setIdentifier("admin@example.com");
      setPassword("adminpassword");
    } else {
      setIdentifier("test@example.com");
      setPassword("testpassword");
    }
    setIsLogin(true);
  };

  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl border border-white/20">
                🔱
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.full_name}</h1>
                <p className="text-amber-200 text-sm flex items-center gap-2 mt-1">
                  <span className="capitalize font-semibold bg-amber-800/80 px-2.5 py-0.5 rounded-full text-xs border border-amber-500/30">
                    Role: {user.role}
                  </span>
                  <span>• Devotee Profile</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <Mail className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 block uppercase font-bold">
                  Email Address
                </span>
                <span className="text-gray-900 font-medium">
                  {user.email || "Not provided"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <Phone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 block uppercase font-bold">
                  Phone Number
                </span>
                <span className="text-gray-900 font-medium">
                  {user.phone || "Not provided"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <Globe className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 block uppercase font-bold">
                  Preferred Language
                </span>
                <span className="text-gray-900 font-medium">
                  {user.preferred_language || "Hindi"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500 block uppercase font-bold">
                  Address
                </span>
                <span className="text-gray-900 font-medium">
                  {user.address || "Temple Town, Varanasi"}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 text-xs text-amber-800 flex items-center justify-between">
            <span>Devotee Account Status: Active & Verified</span>
            <span className="font-mono text-amber-900">
              ID: {user.id?.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md border border-amber-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-full bg-amber-100 border border-amber-300 items-center justify-center text-2xl text-amber-700 mb-2">
            🔱
          </div>
          <h2 className="text-2xl font-bold text-amber-900">
            Devotee & Admin Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sign in to book poojas, track donations & access services
          </p>
        </div>

        {/* Test Credentials Helper Card */}
        <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
          <span className="font-bold text-amber-900 block mb-1">
            🔑 Quick Test Credentials:
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => fillQuickCredentials("devotee")}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium text-xs transition"
            >
              Devotee: test@example.com / testpassword
            </button>
            <button
              type="button"
              onClick={() => fillQuickCredentials("admin")}
              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded font-medium text-xs transition"
            >
              Admin: admin@example.com / adminpassword
            </button>
          </div>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition ${
              isLogin
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition ${
              !isLogin
                ? "border-amber-700 text-amber-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Register Profile
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. test@example.com or +919876543210"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Devotee Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="devotee@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preferred Language
              </label>
              <select
                value={regLanguage}
                onChange={(e) => setRegLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="Hindi">Hindi</option>
                <option value="Sanskrit">Sanskrit</option>
                <option value="English">English</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City / Address
              </label>
              <input
                type="text"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
                placeholder="Varanasi, UP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "Register Devotee Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
