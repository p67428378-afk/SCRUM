import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-background">
      {/* TopAppBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-20">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-body-md"
              placeholder="Search inventory..."
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(
                    `/inventory?search=${encodeURIComponent(e.target.value)}`,
                  );
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:text-on-surface transition-colors hover:bg-surface-container-low p-2 rounded-full">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">
                account_circle
              </span>
            </div>
            <div className="hidden md:block">
              <div className="font-label-md text-label-md text-on-surface">
                Sarah Chen
              </div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                Store Manager
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[280px] mt-16 p-margin-desktop min-h-[calc(100vh-64px)]">
        <div className="max-w-container-max mx-auto space-y-gutter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
