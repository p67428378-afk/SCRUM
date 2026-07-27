import React from "react";
import { Bell } from "lucide-react";

export default function Header({ user }) {
  return (
    <header className="fixed top-0 right-0 h-16 left-sidebar-width bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-10">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all duration-200">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-bold border border-outline-variant">
            {user?.username?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-on-surface hidden md:inline">
            {user?.username || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}
