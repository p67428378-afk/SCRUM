import React from "react";
import { Plus, Search, Bell } from "lucide-react";

export default function Header({
  onNewTask,
  searchQuery,
  onSearchChange,
  user,
}) {
  return (
    <header className="h-16 border-b border-slate-700 bg-slate-800/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Global Search Bar */}
      <div className="relative w-72">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Actions & User */}
      <div className="flex items-center gap-4">
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}

        <button
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-700"></div>

        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <span className="hidden md:inline">
            {user?.full_name || user?.email || "Account"}
          </span>
        </div>
      </div>
    </header>
  );
}
