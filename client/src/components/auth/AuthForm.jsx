import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { loginApi, signupApi } from "../../services/api";

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginApi(email, password);
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          onAuthSuccess(data);
        } else {
          setError("Login succeeded but no access token received.");
        }
      } else {
        await signupApi(email, password, fullName);
        setSuccessMsg("Registration successful! Logging in...");
        // Auto login after signup
        const loginData = await loginApi(email, password);
        if (loginData.access_token) {
          localStorage.setItem("token", loginData.access_token);
          onAuthSuccess(loginData);
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Authentication failed. Please check your credentials.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Left Column: Brand & Feature Showcase */}
      <div className="md:w-1/2 p-8 md:p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-wide text-white">
              TaskFlow
            </span>
            <span className="block text-xs text-indigo-400 font-medium">
              Enterprise Work Management
            </span>
          </div>
        </div>

        <div className="my-12 space-y-6 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Streamline your daily tasks & boost productivity.
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Real-time task tracking, priority matrixing, analytics dashboard,
            and automated workflows designed for modern teams.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span>Real-time metric cards and completion analytics</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
              <span>Filter by priority, due date, tags, and status</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span>Secure JWT session isolation</span>
            </div>
          </div>
        </div>

        {/* Test Credential Notice */}
        <div className="p-4 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
          <span className="font-semibold text-indigo-300 block mb-1">
            🔑 Demo Credentials:
          </span>
          <p>
            Email:{" "}
            <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-white">
              test@example.com
            </code>
          </p>
          <p>
            Password:{" "}
            <code className="bg-indigo-900/80 px-1.5 py-0.5 rounded text-white">
              testpassword
            </code>
          </p>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-slate-900">
        <div className="w-full max-w-md space-y-8">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`pb-3 font-semibold text-sm transition-colors relative flex-1 text-center ${
                isLogin
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Sign In
              {isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
              )}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`pb-3 font-semibold text-sm transition-colors relative flex-1 text-center ${
                !isLogin
                  ? "text-indigo-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Register
              {!isLogin && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
              )}
            </button>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white">
              {isLogin ? "Welcome back" : "Create an account"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin
                ? "Enter your credentials to access your task dashboard."
                : "Sign up to start organizing your tasks."}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
