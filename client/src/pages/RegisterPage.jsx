import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seller"); // Default to seller for marketplace listings
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        full_name: fullName,
        role,
      });
      // Auto login after registration
      await authService.login({ email, password });
      if (role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errMsg =
        err.response?.data?.detail || "Registration failed. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-[80vh] p-6 w-full"
      data-testid="register-page"
    >
      <div className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-6 p-8 rounded-[14px] shadow-md w-full max-w-[400px]">
        <div className="text-center">
          <h2 className="font-bold text-[#1f1712] text-2xl">Create Account</h2>
          <p className="text-[#7a7066] text-sm mt-1">
            Join PurrfectMatch today
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          {/* Full Name Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              Password (min 6 chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none"
            />
          </div>

          {/* Role Field */}
          <div className="flex flex-col gap-1 w-full">
            <label className="font-medium text-[#7a7066] text-xs">
              I want to
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
            >
              <option value="seller">
                List cats for adoption/sale (Seller)
              </option>
              <option value="buyer">Browse and adopt cats (Buyer)</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#eb590d] text-white text-sm px-4 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium w-full mt-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="text-center text-sm text-[#7a7066]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#eb590d] hover:underline font-medium"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
