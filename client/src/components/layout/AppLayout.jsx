import React from "react";
import Header from "./Header";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F172A] text-on-background font-body-md">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <aside className="bg-surface-container border-r border-outline-variant w-[280px] hidden lg:flex flex-col h-full p-stack-md gap-stack-sm shrink-0">
          <div className="mb-4">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Strategy Engine
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              FY24 Assortment Planning
            </p>
          </div>
          <nav className="flex-1 flex flex-col gap-2">
            <a
              className="flex items-center gap-3 px-3 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold font-data-label text-data-label scale-95 duration-75"
              href="#"
            >
              <span className="material-symbols-outlined">analytics</span>{" "}
              Scenarios
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
              href="#"
            >
              <span className="material-symbols-outlined">insights</span> KPI
              Deep-dive
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
              href="#"
            >
              <span className="material-symbols-outlined">list_alt</span> SKU
              Analysis
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
              href="#"
            >
              <span className="material-symbols-outlined">check_circle</span>{" "}
              Approvals
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
              href="#"
            >
              <span className="material-symbols-outlined">history</span> History
            </a>
          </nav>
          <div className="mt-auto">
            <button className="w-full bg-primary text-on-primary py-2 rounded-lg font-bold mb-4 hover:opacity-90 transition-opacity">
              New Analysis
            </button>
            <div className="flex flex-col gap-2">
              <a
                className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
                href="#"
              >
                <span className="material-symbols-outlined">help</span> Help
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-data-label text-data-label hover:bg-surface-container-highest transition-all scale-95 duration-75"
                href="#"
              >
                <span className="material-symbols-outlined">
                  contact_support
                </span>{" "}
                Support
              </a>
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto p-container-padding max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
