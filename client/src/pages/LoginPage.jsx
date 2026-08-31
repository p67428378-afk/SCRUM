import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckSquare, Lock, Mail, User, Shield } from "lucide-react";

export const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSetQuickCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        await register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        });
        // After register, auto-login
        await login(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate("/projects");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.detail)
          ? err.response.data.detail[0]?.msg
          : null) ||
        "Authentication failed. Please check your credentials.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl">
            <CheckSquare className="w-8 h-8" />
            <span className="text-slate-900 tracking-tight">TeamFlow</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          {isRegister ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Task Management & Team Workflow System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          {/* Test accounts notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 p-4 rounded-b-2xl">
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Pre-configured Demo Accounts:
            </p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>
                  Member:{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                    test@example.com
                  </code>{" "}
                  /{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                    testpassword
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSetQuickCredentials(
                      "test@example.com",
                      "testpassword",
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 font-medium text-[11px]"
                >
                  Use Member
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  Admin:{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                    admin@example.com
                  </code>{" "}
                  /{" "}
                  <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">
                    adminpassword
                  </code>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSetQuickCredentials(
                      "admin@example.com",
                      "adminpassword",
                    )
                  }
                  className="text-blue-600 hover:text-blue-800 font-medium text-[11px]"
                >
                  Use Admin
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 italic">
              Test account: test@example.com / testpassword
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
