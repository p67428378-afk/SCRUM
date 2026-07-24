import React, { useState } from "react";
import { authService } from "../../services/api";

const RegistrationForm = ({ onRegistrationSuccess, onNavigateToLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ssn, setSsn] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(
    "What was the name of your first pet?",
  );
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (pw) => {
    if (pw.length < 12) return "Password must be at least 12 characters long.";
    if (!/[A-Z]/.test(pw))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
      return "Password must contain at least one special character.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(false);

    if (!username || !password || !confirmPassword || !accountNumber || !ssn) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        account_number: accountNumber,
        password,
        ssn,
        username,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      };
      const data = await authService.register(payload);
      setSuccess(
        data.message || "Registration successful! Redirecting to login...",
      );
      setTimeout(() => {
        onRegistrationSuccess();
      }, 2000);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        "Registration failed. Please check your details.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant w-full max-w-md p-xl shadow-lg">
      <div className="text-center mb-xl">
        <h2 className="font-headline-md text-headline-md text-primary mb-xs">
          Create Account
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Register for online banking access.
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

      {success && (
        <div
          className="mb-lg p-md bg-secondary-container text-on-secondary-container rounded border border-secondary text-body-sm font-medium"
          role="alert"
        >
          {success}
        </div>
      )}

      <form className="space-y-lg" onSubmit={handleSubmit}>
        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="reg-username"
          >
            Username / Email
          </label>
          <input
            className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
            id="reg-username"
            name="reg-username"
            type="email"
            placeholder="name@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="account-number"
            >
              Account Number
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="account-number"
              name="account-number"
              type="text"
              placeholder="123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="ssn"
            >
              SSN
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="ssn"
              name="ssn"
              type="text"
              placeholder="999-99-9999"
              value={ssn}
              onChange={(e) => setSsn(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="reg-password"
            >
              Password
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="reg-password"
              name="reg-password"
              type="password"
              placeholder="Min 12 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block font-label-sm text-label-sm text-on-surface mb-xs"
              htmlFor="confirm-password"
            >
              Confirm Password
            </label>
            <input
              className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
              id="confirm-password"
              name="confirm-password"
              type="password"
              placeholder="Confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="security-question"
          >
            Security Question
          </label>
          <select
            className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
            id="security-question"
            name="security-question"
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
          >
            <option value="What was the name of your first pet?">
              What was the name of your first pet?
            </option>
            <option value="What is your mother's maiden name?">
              What is your mother's maiden name?
            </option>
            <option value="What city were you born in?">
              What city were you born in?
            </option>
          </select>
        </div>

        <div>
          <label
            className="block font-label-sm text-label-sm text-on-surface mb-xs"
            htmlFor="security-answer"
          >
            Security Answer
          </label>
          <input
            className="block w-full px-md py-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
            id="security-answer"
            name="security-answer"
            type="text"
            placeholder="Your answer"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            required
          />
        </div>

        <div>
          <button
            className="w-full flex justify-center items-center py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <div className="mt-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Already have an account?{" "}
          <button
            className="font-label-md text-label-md text-secondary hover:text-on-secondary-container transition-colors focus:outline-none"
            onClick={onNavigateToLogin}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;
