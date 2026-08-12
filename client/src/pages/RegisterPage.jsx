import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, UserPlus, AlertCircle } from "lucide-react";
import { registerUser } from "../services/api";
import Button from "../components/common/Button";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "Member",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Email may already be registered.";
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
            Create an Account
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Join LibSys to search and borrow library books
          </p>
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
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Member">Member (Reader)</option>
              <option value="Librarian">Librarian (Admin)</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register</span>
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
