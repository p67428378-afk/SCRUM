import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  User,
  LogOut,
  UtensilsCrossed,
  ShieldAlert,
} from "lucide-react";
import { logoutUser } from "../../services/api";

export default function Navbar({
  brand = "Bandra Hotel Delivery",
  cartCount = 0,
  onOpenCart,
  currentUser,
  onUserChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    if (onUserChange) onUserChange(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md group-hover:bg-amber-700 transition">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-amber-900 block leading-tight">
              {brand}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              Gourmet Food Delivery
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`font-medium text-sm transition ${
              isActive("/")
                ? "text-amber-600 font-semibold"
                : "text-gray-600 hover:text-amber-600"
            }`}
          >
            Digital Menu
          </Link>

          {currentUser && (
            <>
              <Link
                to="/profile"
                className={`font-medium text-sm transition ${
                  isActive("/profile")
                    ? "text-amber-600 font-semibold"
                    : "text-gray-600 hover:text-amber-600"
                }`}
              >
                Order History & Profile
              </Link>
            </>
          )}

          <Link
            to="/staff/dashboard"
            className={`flex items-center gap-1.5 font-medium text-sm px-3 py-1.5 rounded-lg border transition ${
              isActive("/staff/dashboard")
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Staff Portal
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping cart"
            className="relative p-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition border border-amber-200 flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 hidden sm:inline">
              Cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Info */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-amber-600 transition"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
                  {currentUser.full_name
                    ? currentUser.full_name.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {currentUser.full_name || currentUser.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="p-2 text-gray-500 hover:text-red-600 transition rounded-lg hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-medium text-amber-800 hover:text-amber-900 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
