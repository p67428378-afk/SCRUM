import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import { authService } from "./services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(email, password);
      window.location.href = "/";
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant p-8 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container mx-auto">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mountain_flag
            </span>
          </div>
          <h2 className="text-2xl font-bold text-primary">TrekGuide</h2>
          <p className="text-sm text-on-surface-variant">
            Sign in to manage your bookings and availability
          </p>
        </div>

        {error && (
          <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guide@trekguide.com"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary hover:brightness-110 font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:bookingId"
          element={
            <ProtectedRoute>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
