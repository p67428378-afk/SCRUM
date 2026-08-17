import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { authApi } from "../services/api";

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("Test Employee");
  const [role, setRole] = useState("Employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await authApi.login({ email, password });
      if (onLoginSuccess) onLoginSuccess(data.user);
      navigate("/");
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.register({ email, password, full_name: fullName, role });
      setMessage("Registration successful! Please log in.");
      setIsRegister(false);
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Registration failed.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const setTestRoleCredentials = (selectedRole, defaultEmail, defaultName) => {
    setEmail(defaultEmail);
    setPassword("testpassword");
    setFullName(defaultName);
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-[#2663eb] tracking-tight">
          Attendance Hub
        </h1>
        <p className="mt-2 text-sm text-[#707a8c]">
          Enterprise Attendance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#e3e8f0] sm:rounded-[14px] sm:px-10">
          <div className="flex border-b border-[#e3e8f0] mb-6">
            <button
              onClick={() => {
                setIsRegister(false);
                setError(null);
                setMessage(null);
              }}
              type="button"
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                !isRegister
                  ? "border-[#2663eb] text-[#2663eb]"
                  : "border-transparent text-[#707a8c] hover:text-[#171c29]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError(null);
                setMessage(null);
              }}
              type="button"
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                isRegister
                  ? "border-[#2663eb] text-[#2663eb]"
                  : "border-transparent text-[#707a8c] hover:text-[#171c29]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Test Account Helper Banner */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-[#2663eb]">
            <p className="font-semibold mb-1">🔑 Demo Accounts Available:</p>
            <p className="text-gray-700">
              Test account:{" "}
              <code className="font-bold bg-white px-1 py-0.5 rounded border border-blue-200">
                test@example.com
              </code>{" "}
              /{" "}
              <code className="font-bold bg-white px-1 py-0.5 rounded border border-blue-200">
                testpassword
              </code>
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() =>
                  setTestRoleCredentials(
                    "Employee",
                    "test@example.com",
                    "Test Employee",
                  )
                }
                className="bg-white hover:bg-blue-100 text-[#2663eb] px-2 py-0.5 rounded text-[11px] border border-blue-300 font-medium"
              >
                Fill Employee
              </button>
              <button
                type="button"
                onClick={() =>
                  setTestRoleCredentials(
                    "Manager",
                    "manager@example.com",
                    "Test Manager",
                  )
                }
                className="bg-white hover:bg-blue-100 text-[#2663eb] px-2 py-0.5 rounded text-[11px] border border-blue-300 font-medium"
              >
                Fill Manager
              </button>
              <button
                type="button"
                onClick={() =>
                  setTestRoleCredentials(
                    "Admin",
                    "admin@example.com",
                    "Test Admin",
                  )
                }
                className="bg-white hover:bg-blue-100 text-[#2663eb] px-2 py-0.5 rounded text-[11px] border border-blue-300 font-medium"
              >
                Fill Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[#dc2626] rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-[#17a34a] rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form
            onSubmit={isRegister ? handleRegister : handleLogin}
            className="space-y-4"
          >
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-[#707a8c]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg pl-9 p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#707a8c]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg pl-9 p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#707a8c]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg pl-9 p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#707a8c] mb-1">
                  System Role
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-3 text-[#707a8c]" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#f2f5fa] border border-[#e3e8f0] text-[#171c29] text-sm rounded-lg pl-9 p-2.5 focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2663eb] text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-[#1d4ed8] transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading
                ? "Processing..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
