import React, { useState } from "react";
import { authService } from "../../services/api";

const LoginForm = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToRecover,
}) => {
  const [username, setUsername] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(false);

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login({ username, password });
      if (data.mfa_required) {
        onLoginSuccess(data.user_id, username);
      } else {
        setError("MFA is required but was not triggered by the server.");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.detail || "Invalid credentials or server error.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant w-full max-w-md p-xl shadow-lg">
      <div className="text-center mb-xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-xs">
          Welcome Back
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Please enter your credentials to access your account.
        </p>
      </div>

      {error && (
        <div
          className="mb-lg p-md bg-error-container text-on-error-container rounded border border-error text-body-sm font-medium"
          role="alert"
        >
          {error}
        </div>
      )}

      <form className="space-y-lg" onSubmit={handleSubmit}>
        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="username"
          >
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-lg">
                person
              </span>
            </div>
            <input
              className="block w-full pl-xl pr-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-lg">
                lock
              </span>
            </div>
            <input
              className="block w-full pl-xl pr-xl py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="absolute inset-y-0 right-0 pr-sm flex items-center text-secondary font-label-sm text-label-sm hover:text-on-secondary-container transition-colors focus:outline-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              className="h-4 w-4 text-secondary focus:ring-secondary border-outline-variant rounded"
              id="remember-me"
              name="remember-me"
              type="checkbox"
            />
            <label
              className="ml-xs block font-body-sm text-body-sm text-on-surface-variant"
              htmlFor="remember-me"
            >
              Remember Me
            </label>
          </div>
          <div className="text-sm">
            <button
              className="font-label-sm text-label-sm text-secondary hover:text-on-secondary-container transition-colors focus:outline-none"
              type="button"
              onClick={onNavigateToRecover}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <div>
          <button
            className="w-full flex justify-center items-center py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors group disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            <span className="material-symbols-outlined mr-sm text-lg group-hover:scale-110 transition-transform">
              lock_open
            </span>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>

      <div className="mt-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          New to Apex Bank?{" "}
          <button
            className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors focus:outline-none"
            onClick={onNavigateToRegister}
          >
            Register Now
          </button>
        </p>
      </div>

      <div className="mt-md p-sm bg-surface-container rounded text-center text-xs text-on-surface-variant border border-outline-variant">
        <span className="font-semibold">Test Account:</span> test@example.com /
        testpassword
      </div>
    </div>
  );
};

export default LoginForm;
