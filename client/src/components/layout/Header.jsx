import React from 'react';

export default function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="hidden md:flex bg-slate-800 text-slate-200 fixed top-0 right-0 h-[64px] left-[280px] border-b border-slate-700 justify-between items-center px-lg z-20 shadow-none">
      <div className="flex items-center gap-md flex-1">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-[6px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-500 transition-colors"
            placeholder="Search KYC..."
          />
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button className="p-sm text-slate-400 hover:bg-slate-700 hover:text-slate-200 rounded-full transition-colors duration-200 ease-in-out relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer ml-sm border border-slate-700" title="Aarchi Jain">
          AJ
        </div>
      </div>
    </header>
  );
}
