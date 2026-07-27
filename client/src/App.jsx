import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AccountDetailsPage from "./pages/AccountDetailsPage";
import TransfersPage from "./pages/TransfersPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import StatementsPage from "./pages/StatementsPage";
import Button from "./components/common/Button";
import { profileService } from "./services/api";

// Simple Profile Page component implemented inline to satisfy the /profile route
function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [alertOnTransfer, setAlertOnTransfer] = useState(false);
  const [alertOnLogin, setAlertOnLogin] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("1000.00");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
        setFullName(data.full_name);
        setEmail(data.email);
        setPhoneNumber(data.phone_number);
        setAddress(data.address);
        setAlertOnTransfer(data.alert_on_transfer);
        setAlertOnLogin(data.alert_on_login);
        setAlertThreshold(data.alert_threshold);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const updated = await profileService.updateProfile({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        address: address,
        alert_on_transfer: alertOnTransfer,
        alert_on_login: alertOnLogin,
        alert_threshold: parseFloat(alertThreshold) || 0,
      });
      setSuccess("Profile and alert preferences updated successfully!");
      setProfile(updated);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-on-surface-variant">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-1">
          Profile & Alerts
        </h1>
        <p className="text-sm text-on-surface-variant">
          Manage your contact information and security alert preferences
        </p>
      </div>

      {error && (
        <div
          className="p-3 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-brand-emerald/10 border border-brand-emerald text-emerald rounded-lg text-sm">
          {success}
        </div>
      )}

      <form
        onSubmit={handleUpdate}
        className="glass-card rounded-xl p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo"
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-border pt-6 space-y-4">
          <h3 className="text-lg font-bold text-on-surface">
            Alert Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnLogin}
                onChange={(e) => setAlertOnLogin(e.target.checked)}
                className="rounded bg-[#0F172A] border-slate-border text-brand-indigo focus:ring-brand-indigo"
              />
              <span className="text-sm text-on-surface">
                Alert me on every login attempt
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnTransfer}
                onChange={(e) => setAlertOnTransfer(e.target.checked)}
                className="rounded bg-[#0F172A] border-slate-border text-brand-indigo focus:ring-brand-indigo"
              />
              <span className="text-sm text-on-surface">
                Alert me on funds transfers
              </span>
            </label>
          </div>

          {alertOnTransfer && (
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Alert Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 px-3 focus:ring-1 focus:ring-brand-indigo"
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full md:w-auto px-8"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <AppLayout user={user}>
                <DashboardPage user={user} />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/accounts"
          element={
            user ? (
              <AppLayout user={user}>
                <AccountDetailsPage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/transfers"
          element={
            user ? (
              <AppLayout user={user}>
                <TransfersPage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            user ? (
              <AppLayout user={user}>
                <ProfilePage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/statements"
          element={
            user ? (
              <AppLayout user={user}>
                <StatementsPage />
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? (
              <AppLayout user={user}>
                <AdminSupportPage />
              </AppLayout>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
