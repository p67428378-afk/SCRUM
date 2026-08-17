import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import PortfolioPage from "./pages/PortfolioPage";
import ConcertsPage from "./pages/ConcertsPage";
import TicketSelectionPage from "./pages/TicketSelectionPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#12121c] text-[#f5f5fa] flex flex-col font-sans antialiased">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/portfolio" replace />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/concerts" element={<ConcertsPage />} />
            <Route
              path="/concerts/:id/tickets"
              element={<TicketSelectionPage />}
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/confirmation/:bookingId"
              element={<ConfirmationPage />}
            />
            <Route path="*" element={<Navigate to="/portfolio" replace />} />
          </Routes>
        </main>

        <footer className="bg-[#1f1f2e] border-t border-[#2d2d42] py-8 text-center text-xs text-[#9ea3b8] mt-12">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-bold text-white">
              AUJLA • World Tour 2026 Ticket Booking Platform
            </p>
            <p>
              Powered by React 18, Vite, Tailwind CSS & FastAPI • PCI-DSS SAQ A
              Compliant Multi-Currency Payment System
            </p>
            <p className="text-[11px] text-[#21c45c]">
              Test Credentials: test@example.com / testpassword
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
