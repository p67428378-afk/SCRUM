import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AppLayout from "./components/layout/AppLayout";
import { profileService, authService } from "./services/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setStudent(data);
    } catch (err) {
      // If unauthorized, clear token
      localStorage.removeItem("token");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore error on logout
    } finally {
      setIsAuthenticated(false);
      setStudent(null);
      navigate("/login");
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setStudent(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <AppLayout student={student} onLogout={handleLogout}>
              <DashboardPage />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <AppLayout student={student} onLogout={handleLogout}>
              <ProfileSettingsPage onProfileUpdate={handleProfileUpdate} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
