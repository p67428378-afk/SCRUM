import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Truck, Trash2, Calendar, BarChart2, Shield } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/pickups", label: "Pickup Scheduling", icon: Calendar },
    { path: "/bins", label: "Bin Telemetry", icon: Trash2 },
    { path: "/driver/tasks", label: "Driver Routes", icon: Truck },
    { path: "/admin/analytics", label: "Admin Analytics", icon: BarChart2 },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <Link
                to="/pickups"
                className="text-xl font-bold text-blue-900 tracking-tight hover:opacity-90"
              >
                EcoClean Municipal
              </Link>
              <span className="block text-[10px] text-slate-500 font-medium -mt-1">
                Garbage Management System
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === "/pickups" && location.pathname === "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600 font-medium hidden lg:inline">
              Test Account:
            </span>
            <span className="font-mono text-slate-800 font-semibold">
              test@example.com
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
