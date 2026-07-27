import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  User,
  ShieldAlert,
  LogOut,
  Plus,
} from "lucide-react";
import { authService } from "../../services/api";

export default function Sidebar({ user, onNewTransaction }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Force logout locally anyway
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/accounts", label: "Accounts", icon: Landmark },
    { path: "/transfers", label: "Transfers", icon: ArrowLeftRight },
    { path: "/profile", label: "Profile & Alerts", icon: User },
  ];

  if (user?.role === "admin") {
    menuItems.push({
      path: "/admin",
      label: "Admin Support",
      icon: ShieldAlert,
    });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface border-r border-outline-variant flex flex-col py-6 z-20">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-brand-indigo flex items-center justify-center text-white font-bold">
          TF
        </div>
        <div>
          <div className="text-lg font-bold text-on-surface">
            Toyota Financial
          </div>
          <div className="text-xs text-on-surface-variant">Savings Bank</div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <button
          onClick={onNewTransaction}
          className="w-full bg-indigo-btn rounded-lg py-2 font-semibold flex items-center justify-center gap-2 shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={18} />
          New Transaction
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 border-l-2 ${
                isActive
                  ? "text-primary border-brand-indigo bg-brand-indigo/10 font-semibold"
                  : "text-on-surface-variant border-transparent hover:bg-secondary-container/20"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-6">
        <div className="flex items-center justify-between py-2 text-on-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-bold">
              {user?.username?.substring(0, 2).toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">
              {user?.username || "User"}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
