import React from "react";
import { Shield, User, Bell } from "lucide-react";
import { authService } from "../../services/api";

export const Header = () => {
  const user = authService.getCurrentUser();

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-8 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          AES-256 Encrypted Session
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-slate-700 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-on-surface">
                {user.username}
              </div>
              <div className="text-xs text-on-surface-variant">
                {user.email}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
