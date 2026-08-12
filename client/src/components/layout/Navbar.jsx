import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Radio,
  CheckCircle,
  AlertTriangle,
  User,
  Zap,
} from "lucide-react";

export default function Navbar({
  wsConnected,
  connectionMode,
  user,
  onLogout,
}) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          {/* Brand */}
          <div class="flex items-center space-x-3">
            <Link
              to="/tasks"
              class="flex items-center space-x-2 font-bold text-xl text-blue-400 hover:text-blue-300 transition"
            >
              <Activity class="w-6 h-6 text-blue-500 animate-pulse" />
              <span>TaskTracker AI</span>
            </Link>
            <span class="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full font-mono">
              v1.0
            </span>
          </div>

          {/* Nav Links */}
          <div class="hidden md:flex items-center space-x-1">
            <Link
              to="/tasks"
              class={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/tasks") || isActive("/")
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/tasks/monitor"
              class={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/tasks/monitor")
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Live Monitor
            </Link>
            <Link
              to="/tasks/history"
              class={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive("/tasks/history")
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              Task History
            </Link>
          </div>

          {/* Connection Status & User Profile */}
          <div class="flex items-center space-x-4">
            {/* Connection Badge */}
            <div
              class={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                wsConnected
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                  : "bg-amber-950 text-amber-300 border-amber-800"
              }`}
            >
              {wsConnected ? (
                <>
                  <Zap class="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span>⚡ WS Connected</span>
                </>
              ) : (
                <>
                  <Radio class="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>🔄 Polling (2-3s)</span>
                </>
              )}
            </div>

            {/* User Profile */}
            <div class="flex items-center space-x-2 border-l border-slate-700 pl-4">
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {user?.email ? user.email.substring(0, 2).toUpperCase() : "SA"}
              </div>
              <div class="hidden sm:block text-left text-xs">
                <div class="font-medium text-gray-200">
                  {user?.email || "test@example.com"}
                </div>
                <div class="text-gray-400 text-[10px]">Test Account</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
