import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import CreateListingPage from "./pages/CreateListingPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { authService } from "./services/api";
import { Dog, Heart } from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans text-textPrimary antialiased">
        <Navbar user={user} onLogout={handleLogout} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/dashboard" element={<SellerDashboardPage />} />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onLoginSuccess={handleLoginSuccess} />}
            />
          </Routes>
        </main>

        <footer className="bg-white border-t border-[#e3e8f0] py-6 text-center text-xs text-textMuted">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Dog className="w-5 h-5" />
              <span>Paws & Homes &copy; {new Date().getFullYear()}</span>
            </div>
            <p className="flex items-center gap-1">
              Connecting loving buyers with ethical dog breeders & sellers
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
