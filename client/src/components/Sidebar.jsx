import React from "react";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle,
  Layers,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-dg-dark text-white flex flex-col h-screen sticky top-0">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-neutral-800 flex items-center gap-3 bg-black">
        <div className="w-10 h-10 bg-dg-yellow rounded flex items-center justify-center text-black font-black text-xl shadow-md">
          DG
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wider text-dg-yellow">
            DOLLAR GENERAL
          </h1>
          <p className="text-xs text-neutral-400 font-medium">
            Category Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="text-xs font-semibold text-neutral-500 px-3 mb-2 uppercase tracking-wider">
          Advisor Tools
        </div>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-neutral-800 text-dg-yellow font-medium text-sm transition-all"
        >
          <LayoutDashboard size={18} />
          <span>Assortment Advisor</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white font-medium text-sm transition-all"
        >
          <BarChart3 size={18} />
          <span>Performance Analytics</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white font-medium text-sm transition-all"
        >
          <Layers size={18} />
          <span>Cluster Config</span>
        </a>
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-neutral-800 space-y-3">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white font-medium text-sm transition-all"
        >
          <Settings size={18} />
          <span>Settings</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white font-medium text-sm transition-all"
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
        <div className="pt-2 border-t border-neutral-800 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-dg-yellow text-black font-bold flex items-center justify-center text-xs">
            CM
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Category Manager</p>
            <p className="text-[10px] text-neutral-400">Small Town Value</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
