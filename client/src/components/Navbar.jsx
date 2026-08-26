import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import {
  Dog,
  PlusCircle,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-[#e3e8f0] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight hover:opacity-90 transition"
        >
          <Dog className="w-7 h-7 text-primary" />
          <span>Paws & Homes</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-textMuted">
          <Link
            to="/"
            className={`flex items-center gap-1.5 transition ${
              isActive("/")
                ? "text-primary font-semibold"
                : "hover:text-primary"
            }`}
          >
            Find Dogs
          </Link>
          <Link
            to="/create-listing"
            className={`flex items-center gap-1.5 transition ${
              isActive("/create-listing")
                ? "text-primary font-semibold"
                : "hover:text-primary"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Sell a Dog
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 transition ${
              isActive("/dashboard")
                ? "text-primary font-semibold"
                : "hover:text-primary"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Seller Dashboard
          </Link>
        </nav>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#f2f5fa] px-3 py-1.5 rounded-full text-xs font-medium text-textPrimary">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>{user.full_name || user.email}</span>
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-md transition"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 rounded-md transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-blue-700 rounded-md shadow-sm transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
