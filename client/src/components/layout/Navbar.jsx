import React from "react";
import { NavLink } from "react-router-dom";
import { CloudRain, Compass, Calendar, Bell, Radio } from "lucide-react";

export default function Navbar() {
  const navItems = [
    { name: "Live Dashboard", path: "/dashboard", icon: CloudRain },
    { name: "Stations Directory", path: "/locations", icon: Compass },
    { name: "Forecasts & Trends", path: "/forecasts", icon: Calendar },
    { name: "Alerts & Rules", path: "/alerts", icon: Bell },
  ];

  return (
    <nav className="bg-[#171F33] border-b border-[#3C494E] px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00D1FF]/10 rounded-lg border border-[#00D1FF]/30">
            <Radio className="w-6 h-6 text-[#00D1FF] animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-white">
              Weather<span className="text-[#00D1FF]">Pulse</span>
            </span>
            <span className="block text-xs text-[#BBC9CF] font-mono">
              STATION TELEMETRY NETWORK
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/40"
                      : "text-[#BBC9CF] hover:text-[#DAE2FD] hover:bg-[#222A3D]"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-2 bg-[#222A3D] px-3 py-1.5 rounded-full border border-[#3C494E]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[#10B981] font-semibold">SYSTEM LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
