import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "../../services/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Tenzing Norgay",
    email: "tenzing@trekguide.com",
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="h-screen w-[280px] fixed left-0 top-0 bg-surface-container border-r border-outline-variant flex flex-col py-6 z-50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mountain_flag
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">TrekGuide</h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-wider">
            Senior Guide
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-all rounded-r-lg ${
              isActive
                ? "text-primary font-bold border-l-4 border-primary bg-primary/10"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-base">Dashboard</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 transition-all rounded-r-lg ${
              isActive
                ? "text-primary font-bold border-l-4 border-primary bg-primary/10"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`
          }
        >
          <span className="material-symbols-outlined">event_available</span>
          <span className="text-base">Availability</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all rounded-r-lg text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-base">Logout</span>
        </button>
      </nav>

      <div className="px-2 mt-auto">
        <div className="flex items-center gap-3 px-4 py-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center text-primary font-bold bg-primary/10">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-on-surface-variant truncate uppercase tracking-tighter">
              Expedition Lead
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
