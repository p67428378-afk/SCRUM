import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  User,
  LogOut,
  Shield,
  Bookmark,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#122338] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition"
            >
              <div className="p-2 bg-[#0d6847] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight">
                  Athenaeum Archives
                </span>
                <span className="text-xs text-gray-300 -mt-1 font-sans">
                  Library Management System
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive("/") || isActive("/catalog")
                  ? "bg-[#1f3552] text-white"
                  : "text-gray-300 hover:bg-[#1f3552]/60 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Book Catalog</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-loans"
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  isActive("/my-loans")
                    ? "bg-[#1f3552] text-white"
                    : "text-gray-300 hover:bg-[#1f3552]/60 hover:text-white"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>My Loans</span>
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center space-x-1.5 ${
                  isActive("/admin")
                    ? "bg-[#1f3552] text-white"
                    : "text-gray-300 hover:bg-[#1f3552]/60 hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">
                    {user?.full_name}
                  </span>
                  <span className="text-xs text-gray-300 flex items-center space-x-1 mt-0.5">
                    <span className="capitalize">{user?.role}</span>
                    {isAdmin && (
                      <span className="bg-emerald-700/80 text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-semibold text-emerald-100">
                        Admin
                      </span>
                    )}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#1f3552] flex items-center justify-center border border-gray-600">
                  <User className="w-5 h-5 text-gray-200" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-white hover:bg-[#1f3552] rounded-md transition"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0d6847] hover:bg-[#0d6847]/90 shadow-sm transition"
                >
                  Sign In / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
