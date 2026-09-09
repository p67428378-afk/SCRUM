import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Pill,
  Bell,
  Building2,
  User,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";

export const Navbar = ({ alertCount = 0 }) => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                  PharmaCare
                </span>
                <span className="text-xs text-slate-500 font-medium block">
                  Drugs Management System
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname === "/"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/alerts"
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition relative ${
                  location.pathname === "/alerts"
                    ? "bg-amber-50 text-amber-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Alerts Center</span>
                {alertCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                    {alertCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Facility Selector & Profile */}
          <div className="flex items-center space-x-4">
            {/* Facility Dropdown */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Central Pharmacy (Main)</span>
            </div>

            {/* Notification Bell */}
            <Link
              to="/alerts"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition"
              title="View Alerts"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>

            {/* User Profile */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                PA
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-semibold text-slate-800">
                  Pharmacist Admin
                </div>
                <div className="text-slate-400">License #PH-8892</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
