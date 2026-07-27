import React, { useState } from "react";
import Button from "../common/Button";

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("testuser");
  const [password, setPassword] = useState("testpassword");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await onLoginSuccess({ username, password });
    } catch (err) {
      setError(
        err.response?.data?.detail || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-card rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-indigo flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
          TF
        </div>
        <h2 className="text-2xl font-bold text-on-surface">Secure Login</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Toyota Financial Savings Bank
        </p>
      </div>

      {error && (
        <div
          className="mb-4 p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-on-surface-variant mb-1"
            htmlFor="username"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-on-surface-variant mb-1"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-brand-indigo/5 border border-brand-indigo/20 rounded-lg text-xs text-on-surface-variant space-y-1">
        <p className="font-semibold text-on-surface">Test Accounts:</p>
        <p>
          • Customer: <span className="font-mono text-primary">testuser</span> /{" "}
          <span className="font-mono text-primary">testpassword</span> (Sarah
          Jenkins)
        </p>
        <p>
          • Admin: <span className="font-mono text-primary">adminuser</span> /{" "}
          <span className="font-mono text-primary">adminpassword</span> (Admin
          Support)
        </p>
        <p className="text-[10px] mt-2 text-outline">
          Note: Email for Sarah is test@example.com
        </p>
      </div>
    </div>
  );
}
