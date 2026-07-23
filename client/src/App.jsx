import React from "react";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* SideNav - Immutable Content & Mandatory Styling Application */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container border-r border-outline-variant flex flex-col py-6 hidden md:flex z-50">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-400 text-black font-black text-xl">
            DG
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Advisor Suite
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Category Management
            </p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-r-2 border-primary bg-surface-container-highest scale-[0.98] transition-transform"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <span className="font-label-md text-label-md">Overview</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              analytics
            </span>
            <span className="font-label-md text-label-md">Analytics</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              layers
            </span>
            <span className="font-label-md text-label-md">Scenarios</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              inventory_2
            </span>
            <span className="font-label-md text-label-md">Inventory</span>
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              settings
            </span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
        </nav>
        <div className="px-4 mt-auto">
          <button className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-[0_0_12px_rgba(192,193,255,0.3)]">
            Review & Approve
          </button>
          <a
            className="flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              help_outline
            </span>
            <span className="font-label-md text-label-md">Support</span>
          </a>
        </div>
      </aside>

      {/* TopNav */}
      <Header />

      {/* Main Content */}
      <DashboardPage />
    </div>
  );
}
