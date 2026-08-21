import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="bg-white border border-[#e5e0d9] border-solid flex items-center justify-between px-8 py-4 w-full shadow-sm"
      data-testid="navbar"
    >
      <div className="flex gap-6 items-center">
        <Link
          to="/"
          className="font-bold text-[#eb590d] text-lg hover:opacity-90 transition-opacity"
        >
          PurrfectMatch
        </Link>
        <div className="flex gap-6 items-center text-[#7a7066] text-sm font-medium">
          <Link to="/" className="hover:text-[#eb590d] transition-colors">
            Browse Cats
          </Link>
          {user && user.role === "seller" && (
            <Link
              to="/dashboard"
              className="hover:text-[#eb590d] transition-colors"
            >
              Seller Portal
            </Link>
          )}
        </div>
      </div>
      <div className="flex gap-4 items-center">
        {user ? (
          <div className="flex gap-4 items-center">
            <span className="text-sm text-[#7a7066] hidden sm:inline">
              Hello, {user.full_name}
            </span>
            <div className="bg-[#eb590d] flex items-center justify-center rounded-full w-8 h-8 text-white font-bold text-xs">
              {getInitials(user.full_name)}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-[#7a7066] hover:text-[#eb590d] transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-sm text-[#7a7066] hover:text-[#eb590d] transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#eb590d] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#d44f0b] transition-colors font-medium"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
