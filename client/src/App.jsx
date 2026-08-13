import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import CatalogPage from "./pages/CatalogPage";
import MyLoansPage from "./pages/MyLoansPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const ProtectedRoute = ({ children, requireLibrarian = false }) => {
  const { user, loading, isLibrarian } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireLibrarian && !isLibrarian) {
    return <Navigate to="/catalog" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/my-loans"
                element={
                  <ProtectedRoute>
                    <MyLoansPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireLibrarian={true}>
                    <AdminInventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute requireLibrarian={true}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} LibSys Library Management System. All
              rights reserved.
            </p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
