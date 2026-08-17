import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music, Calendar, Ticket, Search, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupRef, setLookupRef] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (lookupRef && lookupEmail) {
      setShowLookupModal(false);
      navigate(
        `/confirmation/${lookupRef}?email=${encodeURIComponent(lookupEmail)}`,
      );
    }
  };

  return (
    <header className="bg-[#1f1f2e] border-b border-[#2d2d42] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/portfolio" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7a3bed] to-[#a855f7] flex items-center justify-center text-white shadow-lg shadow-[#7a3bed]/30 group-hover:scale-105 transition-transform">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white tracking-wider block">
              AUJLA
            </span>
            <span className="text-[10px] text-[#7a3bed] font-bold tracking-widest uppercase block -mt-1">
              World Tour
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-1 sm:space-x-6">
          <Link
            to="/portfolio"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/portfolio" || location.pathname === "/"
                ? "bg-[#7a3bed]/20 text-[#a855f7] border border-[#7a3bed]/40"
                : "text-[#9ea3b8] hover:text-white hover:bg-[#2a2a3d]"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Artist Bio</span>
          </Link>

          <Link
            to="/concerts"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/concerts"
                ? "bg-[#7a3bed]/20 text-[#a855f7] border border-[#7a3bed]/40"
                : "text-[#9ea3b8] hover:text-white hover:bg-[#2a2a3d]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tour Schedule</span>
          </Link>

          <button
            onClick={() => setShowLookupModal(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-[#9ea3b8] hover:text-white hover:bg-[#2a2a3d] transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span>Order Lookup</span>
          </button>
        </nav>
      </div>

      {showLookupModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
              <Search className="w-5 h-5 text-[#7a3bed]" />
              <span>Retrieve Digital Pass</span>
            </h3>
            <p className="text-sm text-[#9ea3b8] mb-6">
              Enter your booking reference (e.g., BK-12345678) and email address
              to view or download your QR tickets.
            </p>

            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                  Booking Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="BK-XXXXXXXX"
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  defaultValue="test@example.com"
                  placeholder="test@example.com"
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed]"
                />
                <p className="text-[11px] text-[#21c45c] mt-1">
                  Default test email: test@example.com
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLookupModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#9ea3b8] hover:text-white hover:bg-[#2d2d42] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#7a3bed] text-white hover:bg-[#682bd6] shadow-lg shadow-[#7a3bed]/30 transition-all"
                >
                  Find Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
