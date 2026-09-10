import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Scissors, Calendar, Users, Award, Sparkles } from "lucide-react";
import DashboardPage from "./pages/DashboardPage";
import StaffPage from "./pages/StaffPage";
import CustomersPage from "./pages/CustomersPage";

export default function App() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FCF9F8] text-[#151C24] flex flex-col font-sans">
      {/* Top Brand Header & Navigation */}
      <header className="bg-white border-b border-rose-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[#5B1D2E] text-white flex items-center justify-center shadow transition-transform group-hover:scale-105">
                <Scissors className="w-5 h-5 text-[#F4EAE6]" />
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-[#5B1D2E] tracking-tight block">
                  Glow & Grace
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#B87D7E] font-semibold block -mt-1">
                  Beauty Salon Management
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 sm:space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive("/")
                    ? "bg-[#5B1D2E] text-white shadow-sm"
                    : "text-[#534345] hover:bg-rose-50 hover:text-[#5B1D2E]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Appointments</span>
              </Link>

              <Link
                to="/staff"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive("/staff")
                    ? "bg-[#5B1D2E] text-white shadow-sm"
                    : "text-[#534345] hover:bg-rose-50 hover:text-[#5B1D2E]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Staff & Schedules</span>
              </Link>

              <Link
                to="/customers"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive("/customers")
                    ? "bg-[#5B1D2E] text-white shadow-sm"
                    : "text-[#534345] hover:bg-rose-50 hover:text-[#5B1D2E]"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Customers & Loyalty</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/customers" element={<CustomersPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-200 py-6 text-center text-xs text-[#534345]">
        <p>
          © 2026 Glow & Grace Beauty Salon. Unified Salon Operations & Customer
          Portal.
        </p>
      </footer>
    </div>
  );
}
