// Validated & verified for SCRUM-125
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CatalogPage from "./pages/CatalogPage";
import DetailPage from "./pages/DetailPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#1f1712] font-sans">
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/cats/:id" element={<DetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center py-24 gap-4 max-w-md mx-auto text-center">
                  <h2 className="text-2xl font-bold text-red-600">
                    404 - Page Not Found
                  </h2>
                  <p className="text-[#7a7066]">
                    The page you are looking for does not exist.
                  </p>
                  <a
                    href="/"
                    className="bg-[#eb590d] text-white px-6 py-3 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium"
                  >
                    Return to Catalog
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
