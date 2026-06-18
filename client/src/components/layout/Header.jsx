import React from "react";

export default function Header({
  onSearch,
  onAddBookingClick,
  unreadCount = 0,
}) {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-6 ml-[280px]">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-on-surface"
            placeholder="Search bookings, clients..."
            type="text"
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full relative">
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          )}
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant mx-2"></div>
        {onAddBookingClick && (
          <button
            onClick={onAddBookingClick}
            className="bg-primary-container text-on-primary-container hover:brightness-110 px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-sm">Add Booking</span>
          </button>
        )}
      </div>
    </header>
  );
}
