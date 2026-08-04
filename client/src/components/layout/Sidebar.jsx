import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  AlertTriangle,
  Boxes,
} from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/catalog", label: "Item Catalog", icon: Package },
    { path: "/adjustments", label: "Stock Adjustments", icon: ArrowLeftRight },
    { path: "/alerts", label: "Low Stock Alerts", icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700/60 flex flex-col flex-shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/60">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Boxes className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide">
            StockPulse
          </h1>
          <p className="text-xs text-slate-400">Inventory Manager</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/60 text-xs text-slate-500">
        StockPulse v1.0.0 &bull; Enterprise
      </div>
    </aside>
  );
};

export default Sidebar;
