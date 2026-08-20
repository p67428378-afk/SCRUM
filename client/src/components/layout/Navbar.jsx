import React from "react";
import { NavLink } from "react-router-dom";
import { MapPin, Bell, Globe, BarChart2, BookOpen } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-[#E3E8F0] px-4 md:px-8 py-4 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Links */}
        <div className="flex items-center gap-6 md:gap-8">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-[#2563EB] font-bold text-lg hover:opacity-90 transition"
          >
            <span className="text-xl">🇮🇳</span>
            <span>BharatGeo Portal</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#707A8C]">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-1.5 transition ${
                  isActive
                    ? "text-[#2563EB] font-semibold"
                    : "hover:text-[#0F172A]"
                }`
              }
            >
              <Globe className="w-4 h-4" />
              <span>Regional Directory</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex items-center gap-1.5 transition ${
                  isActive
                    ? "text-[#2563EB] font-semibold"
                    : "hover:text-[#0F172A]"
                }`
              }
            >
              <BarChart2 className="w-4 h-4" />
              <span>Zonal Analytics</span>
            </NavLink>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-[#0F172A] transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>API Docs</span>
            </a>
          </nav>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-[#059669] text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>GIS Connected</span>
          </div>

          <button
            aria-label="Notifications"
            className="p-2 rounded-full text-[#707A8C] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
