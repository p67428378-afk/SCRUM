import React from "react";
import { Search, Bell, User } from "lucide-react";

export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <header className="flex justify-between items-center w-full px-lg py-md bg-surface border-b border-outline-variant z-30 sticky top-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-md focus-ring rounded-lg bg-surface border border-outline-variant flex items-center px-sm py-xs transition-all duration-200">
        <Search className="text-on-surface-variant w-5 h-5 mr-sm" />
        <input
          className="w-full bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder-on-surface-variant px-0 py-1 outline-none"
          placeholder="Search tasks..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Trailing Icons */}
      <div className="flex items-center gap-sm ml-lg">
        <button className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200 group">
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-label-sm text-[9px] font-bold rounded-full flex items-center justify-center border border-surface">
            2
          </span>
        </button>
        <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200 group">
          <User className="w-5 h-5 group-hover:text-primary transition-colors" />
        </button>
      </div>
    </header>
  );
}
