import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, Compass, Shield, Bell, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-[#e3e8f0] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-[#2663eb] font-bold text-xl tracking-tight"
            >
              <Globe className="w-6 h-6 text-[#2663eb]" />
              <span>GeoPortfolio</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-blue-50 text-[#2663eb]"
                    : "text-[#707a8c] hover:text-[#171c29] hover:bg-gray-50"
                }`}
              >
                <Globe className="w-4 h-4" />
                Continents Dashboard
              </Link>

              <Link
                to="/countries"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/countries")
                    ? "bg-blue-50 text-[#2663eb]"
                    : "text-[#707a8c] hover:text-[#171c29] hover:bg-gray-50"
                }`}
              >
                <Compass className="w-4 h-4" />
                Country Explorer
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#707a8c] hover:text-[#171c29] hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2663eb] font-semibold text-sm">
                PV
              </div>
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-[#171c29]">Portfolio Viewer</p>
                <p className="text-[#707a8c]">Analyst Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
