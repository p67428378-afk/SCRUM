import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Button from "../components/common/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      login(data.user, data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] flex flex-col items-center justify-center min-h-screen p-[32px]">
      <div className="bg-white border border-[#e3e8f0] flex flex-col gap-[20px] p-[32px] rounded-[14px] shadow-[0px_8px_24px_0px_rgba(0,0,0,0.08)] w-full max-w-[440px]">
        <div className="text-center">
          <h2 className="font-bold text-[#171c29] text-[22px] mb-1">
            Grocery Inventory System
          </h2>
          <p className="text-[#707a8c] text-[14px]">
            Sign in to manage inventory, track stock levels, and log
            adjustments.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#db2626] p-[12px] rounded-[10px] text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <label className="text-[#707a8c] text-[12px] font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@example.com"
              className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-[4px]">
            <label className="text-[#707a8c] text-[12px] font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#f2f5fa] border border-[#e3e8f0] p-[12px] rounded-[10px] text-[14px] outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="bg-blue-50 border border-blue-100 p-[12px] rounded-[10px] text-xs text-blue-800">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>
            Email: <span className="font-mono">test@example.com</span>
          </p>
          <p>
            Password: <span className="font-mono">testpassword</span>
          </p>
        </div>

        <p className="text-[#db2626] text-[12px] text-center font-medium">
          Authorized personnel only. All actions are logged in the audit trail.
        </p>
      </div>
    </div>
  );
}
