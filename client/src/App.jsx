import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import DevoteePortal from "./pages/DevoteePortal";
import PoojaCatalog from "./pages/PoojaCatalog";
import BookingModal from "./pages/BookingModal";
import DonationModal from "./pages/DonationModal";
import MyReceipts from "./pages/MyReceipts";
import AdminDashboard from "./pages/AdminDashboard";
import { authAPI } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedBookingSlot, setSelectedBookingSlot] = useState(null); // { pooja, slot }
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (err) {
      console.warn("Token verification failed, clearing stored token:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleOpenBooking = (pooja, slot) => {
    setSelectedBookingSlot({ pooja, slot });
  };

  const handleCloseBooking = () => {
    setSelectedBookingSlot(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-gray-900">
        {/* Navigation Bar */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Main Route Body */}
        <main className="flex-1 pb-12">
          {loadingUser ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin text-3xl mb-2 text-amber-700">
                🔱
              </div>
              <p className="text-gray-500 text-xs font-semibold">
                Initializing temple portal...
              </p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/poojas" replace />} />

              <Route
                path="/poojas"
                element={<PoojaCatalog onSelectPoojaSlot={handleOpenBooking} />}
              />

              <Route path="/donations" element={<DonationModal />} />

              <Route path="/my-receipts" element={<MyReceipts user={user} />} />

              <Route
                path="/devotee-portal"
                element={
                  <DevoteePortal
                    user={user}
                    onLoginSuccess={handleLoginSuccess}
                  />
                }
              />

              <Route
                path="/admin/dashboard"
                element={<AdminDashboard user={user} />}
              />

              <Route path="*" element={<Navigate to="/poojas" replace />} />
            </Routes>
          )}
        </main>

        {/* Global Booking Modal */}
        {selectedBookingSlot && (
          <BookingModal
            pooja={selectedBookingSlot.pooja}
            slot={selectedBookingSlot.slot}
            onClose={handleCloseBooking}
            onBookingComplete={() => {
              // Option to keep modal open or let user navigate
            }}
          />
        )}

        {/* Footer */}
        <footer className="bg-amber-950 text-amber-200/80 py-8 border-t border-amber-900 text-xs mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-amber-100 font-bold text-sm">
              <span>🔱 Shri Shivji Mandir Trust</span>
            </div>
            <p className="text-amber-300/60">
              Varanasi • 80G Tax Exempted Registered Trust • Daily Seva &
              Darshan Timings: 04:00 AM - 11:00 PM
            </p>
            <p className="text-amber-500/50 text-[10px] pt-2">
              Shivji Temple Management System • Built with React 18, Vite,
              Tailwind CSS & FastAPI
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
