import React from "react";

export default function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-280px)] h-[64px] bg-surface shadow-sm justify-between items-center px-xl ml-[280px] z-10">
      {/* Search left */}
      <div className="flex-1 flex items-center">
        <div className="relative w-64 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md text-on-surface placeholder:text-outline transition-all"
            placeholder="Search tasks..."
          />
        </div>
      </div>
      {/* Center Brand */}
      <div className="flex-shrink-0 mx-xl">
        <span className="font-headline-lg text-headline-lg text-primary font-bold">
          Dashboard
        </span>
      </div>
      {/* Right Actions */}
      <div className="flex-1 flex justify-end items-center gap-md text-on-surface-variant">
        <button className="p-2 hover:text-primary hover:bg-surface-container rounded-full transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 hover:text-primary hover:bg-surface-container rounded-full transition-all">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
