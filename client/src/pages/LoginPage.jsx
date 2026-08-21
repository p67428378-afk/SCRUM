import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      if (data.user.role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errMsg = err.response?.data?.detail || "Invalid email or password";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-[80vh] p-6 w-full"
      data-testid="login-page"
    >
      <div className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-6 p-8 rounded-[14px] shadow-md w-full max-w-[400px]">
        <div className="text-center">
          <h2 className="font-bold text-[#1f1712] text-2xl">Welcome Back</h2>
          <p className="text-[#7a7066] text-sm mt-1">
            Login to manage your cat listings
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Email Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
              required
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#eb590d] text-white text-sm px-4 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium w-full mt-2 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Test Credentials Note */}
        <div className="bg-[#faf7f2] border border-[#e5e0d9] p-3 rounded-[10px] text-xs text-[#7a7066] text-center">
          <p className="font-semibold text-[#1f1712] mb-1">
            Test Account Credentials:
          </p>
          <p>
            Email:{" "}
            <span className="font-mono text-[#eb590d]">test@example.com</span>
          </p>
          <p>
            Password:{" "}
            <span className="font-mono text-[#eb590d]">testpassword</span>
          </p>
        </div>

        <div className="text-center text-sm text-[#7a7066]">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#eb590d] hover:underline font-medium"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
