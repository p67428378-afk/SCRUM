import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, LogIn, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/catalog");
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.detail || "Invalid email or password credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to LibSys
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to search, borrow books, and manage loans
          </p>
        </div>

        {/* Test account banner */}
        <div className="bg-blue-50/80 border border-blue-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
          <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Test Account Credentials:</span>
            <div className="font-mono mt-0.5">
              test@example.com / testpassword
            </div>
            <div className="text-slate-500 mt-1">
              Librarian test account: librarian@example.com / testpassword
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
