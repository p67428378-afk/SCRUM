import React from "react";
import { NavLink } from "react-router-dom";
import {
  Coffee,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Grid,
  UserCheck,
} from "lucide-react";

export default function Navbar() {
  const navItems = [
    { path: "/", label: "Overview Dashboard", icon: LayoutDashboard },
    { path: "/menu", label: "Menu Management", icon: UtensilsCrossed },
    { path: "/orders", label: "Live Orders Queue", icon: ClipboardList },
    { path: "/tables", label: "Table Layout & Reservations", icon: Grid },
  ];

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600 rounded-lg text-white shadow">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Artisan Cafe
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                Staff Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* User & Staff Info Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">
                Sarah Connor
              </span>
              <span className="text-[10px] text-slate-400">Shift Manager</span>
            </div>
            <div className="w-9 h-9 bg-amber-600/30 border border-amber-500/50 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
              SC
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-amber-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
