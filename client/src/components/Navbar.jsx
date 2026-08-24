import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Flame,
  HeartHandshake,
  CalendarCheck,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/poojas", label: "Poojas & Sevas", icon: Flame },
    { path: "/donations", label: "Donations & 80G", icon: HeartHandshake },
    {
      path: "/my-receipts",
      label: "My Bookings & Receipts",
      icon: CalendarCheck,
    },
    { path: "/devotee-portal", label: "Devotee Portal", icon: User },
  ];

  if (user && user.role === "admin") {
    navItems.push({
      path: "/admin/dashboard",
      label: "Admin Dashboard",
      icon: ShieldCheck,
    });
  } else {
    navItems.push({
      path: "/admin/dashboard",
      label: "Admin Dashboard",
      icon: ShieldCheck,
    });
  }

  return (
    <header className="bg-white border-b border-amber-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Temple Branding */}
          <Link to="/poojas" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
              🔱
            </div>
            <div>
              <span className="text-xl font-bold text-amber-800 tracking-wide block leading-tight">
                Shri Shivji Mandir
              </span>
              <span className="text-xs font-medium text-amber-600 tracking-wider uppercase block">
                Management System
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 min-w-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${active ? "text-amber-700" : "text-gray-500"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Status */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-amber-900 block leading-tight">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-600 block">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/devotee-portal"
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <User className="w-4 h-4 shrink-0" />
                Devotee Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-amber-100 py-2 flex overflow-x-auto gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                  active
                    ? "bg-amber-700 text-white"
                    : "text-gray-700 hover:bg-amber-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
