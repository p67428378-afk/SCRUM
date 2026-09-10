import React from "react";
import { NavLink } from "react-router-dom";
import {
  Sprout,
  LayoutDashboard,
  MapPin,
  HeartPulse,
  Wrench,
  Package,
  Sun,
  CloudRain,
  User,
} from "lucide-react";

export default function TopNavbar() {
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/fields", label: "Fields & Crops", icon: MapPin },
    { to: "/livestock", label: "Livestock Health", icon: HeartPulse },
    { to: "/equipment", label: "Equipment", icon: Wrench },
    { to: "/inventory", label: "Input Inventory", icon: Package },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-emerald-800/60">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-emerald-950 font-bold">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">AgriCore</span>
              <span className="hidden sm:inline text-xs font-semibold bg-emerald-700/60 text-emerald-200 px-2 py-0.5 rounded ml-2 border border-emerald-600/40">
                Farm Ops v1.0
              </span>
            </div>
          </div>

          {/* Weather & Environmental Widget */}
          <div className="hidden md:flex items-center space-x-4 bg-emerald-800/70 border border-emerald-700/50 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-100">
            <div className="flex items-center space-x-1">
              <Sun className="w-4 h-4 text-amber-300" />
              <span>75°F / 24°C</span>
            </div>
            <span className="text-emerald-600">|</span>
            <div className="flex items-center space-x-1">
              <CloudRain className="w-4 h-4 text-sky-300" />
              <span>Soil Moisture: 68% (Optimal)</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-emerald-100">
                Farm Manager
              </p>
              <p className="text-[10px] text-emerald-300">test@example.com</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-700 border border-emerald-500 flex items-center justify-center text-emerald-100 font-bold text-sm">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-emerald-950 shadow-sm"
                      : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
