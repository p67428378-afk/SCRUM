import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  LogOut,
  CheckCircle2,
} from "lucide-react";

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl text-white tracking-wide">
            TaskFlow
          </h1>
          <p className="text-xs text-slate-400">Task Management & Analytics</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
              isActive
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
              isActive
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            }`
          }
        >
          <CheckSquare className="w-5 h-5" />
          My Tasks
        </NavLink>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center flex-shrink-0">
              {user?.full_name
                ? user.full_name[0].toUpperCase()
                : user?.email
                  ? user.email[0].toUpperCase()
                  : "U"}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.full_name || user?.email || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
