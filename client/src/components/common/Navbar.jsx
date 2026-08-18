import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  PackageSearch,
  ShoppingCart,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/products", label: "Products & Recipes", icon: UtensilsCrossed },
    { path: "/inventory", label: "Ingredient Inventory", icon: PackageSearch },
    { path: "/orders", label: "POS & Orders", icon: ShoppingCart },
  ];

  return (
    <header className="bg-white border-b border-[#E5DED1] sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥐</span>
            <div>
              <span className="font-bold text-[#D96B1F] text-lg sm:text-xl tracking-tight block">
                Artisan Bakery POS
              </span>
              <span className="text-xs text-[#80756B] hidden sm:block">
                Inventory & Recipe Management
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#FAF7F2] text-[#D96B1F] font-semibold border border-[#E5DED1]"
                        : "text-[#80756B] hover:text-[#1F1A14] hover:bg-[#FAF7F2]"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#E5DED1]">
                  <User className="w-4 h-4 text-[#D96B1F]" />
                  <span className="text-xs font-medium text-[#1F1A14]">
                    {currentUser.full_name || currentUser.email}
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-[#D96B1F] text-white px-1.5 py-0.5 rounded">
                    {currentUser.role || "Staff"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-[#80756B] hover:text-[#D92D2D] hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#D96B1F] text-white rounded-md text-sm font-medium hover:bg-[#B85310] transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#E5DED1] bg-[#FAF7F2]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center p-1.5 text-xs ${
                    isActive ? "text-[#D96B1F] font-bold" : "text-[#80756B]"
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
