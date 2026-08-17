import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage";
import TeamApprovalsPage from "./pages/TeamApprovalsPage";
import AuditLogsPage from "./pages/AuditLogsPage";
import { authApi } from "./services/api";

function ProtectedRoute({ currentUser, allowedRoles, children }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const cachedUser = localStorage.getItem("user");

      if (token) {
        if (cachedUser) {
          try {
            setCurrentUser(JSON.parse(cachedUser));
          } catch (e) {
            console.error("Failed to parse cached user:", e);
          }
        }
        try {
          const user = await authApi.getMe();
          setCurrentUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        } catch (err) {
          console.warn("Session expired or invalid token:", err);
          authApi.logout();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center text-[#707a8c] text-sm">
        Initializing Attendance Hub...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans">
        {currentUser && (
          <Navbar currentUser={currentUser} onLogout={handleLogout} />
        )}

        <main
          className={
            currentUser
              ? "flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8"
              : "flex-1"
          }
        >
          <Routes>
            <Route
              path="/login"
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <DashboardPage currentUser={currentUser} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute currentUser={currentUser}>
                  <AttendanceHistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approvals"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  allowedRoles={["Manager", "Admin"]}
                >
                  <TeamApprovalsPage currentUser={currentUser} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute
                  currentUser={currentUser}
                  allowedRoles={["Admin"]}
                >
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
