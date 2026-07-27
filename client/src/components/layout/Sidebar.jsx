import React from "react";
import {
  Shield,
  LogOut,
  LayoutDashboard,
  KeyRound,
  History,
  Send,
  LifeBuoy,
  AlertTriangle,
  Mail,
  Bell,
  Code,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout error
    } finally {
      navigate("/login");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Security & Sessions",
      path: "/security",
      icon: <KeyRound className="w-5 h-5" />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <History className="w-5 h-5" />,
    },
    {
      name: "Transfers & Payments",
      path: "/transfers",
      icon: <Send className="w-5 h-5" />,
    },
    {
      name: "Support Console",
      path: "/support",
      icon: <LifeBuoy className="w-5 h-5" />,
    },
    {
      name: "Compliance & Risk",
      path: "/compliance",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      name: "Secure Messages",
      path: "/messages",
      icon: <Mail className="w-5 h-5" />,
    },
    {
      name: "Alerts & Preferences",
      path: "/alerts",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      name: "Developer Settings",
      path: "/settings/developer",
      icon: <Code className="w-5 h-5" />,
    },
  ];

  // Only show Admin Config to admin users
  if (user && user.role === "admin") {
    menuItems.push({
      name: "System Config",
      path: "/admin/config",
      icon: <Settings className="w-5 h-5" />,
    });
  }

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight">ApexSecure</h1>
          <span className="text-xs text-slate-400">Retail Banking</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-500 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
