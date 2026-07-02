import React from "react";

export default function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-full py-xl bg-surface-container-lowest border-r border-outline-variant w-[280px] fixed left-0 top-0 z-50">
      <div className="px-xl mb-xl flex items-center gap-sm">
        <span
          className="material-symbols-outlined text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          account_balance
        </span>
        <span className="font-headline-md text-headline-md font-bold text-primary">
          Vertex Bank
        </span>
      </div>
      <div className="px-xl mb-lg font-label-md text-label-md text-on-surface-variant">
        Secure Portal
      </div>
      <div className="flex-1 px-lg space-y-sm">
        <a
          className="flex items-center gap-md px-lg py-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 rounded-lg scale-95 active:scale-90 transition-transform"
          href="#"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body-md text-body-md">Dashboard</span>
        </a>
        <a
          className="flex items-center gap-md px-lg py-md bg-secondary-container text-on-secondary-container rounded-lg transition-colors duration-200 scale-95 active:scale-90 transition-transform"
          href="#"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            credit_card
          </span>
          <span className="font-body-md text-body-md font-bold">
            Cards & Alerts
          </span>
        </a>
        <a
          className="flex items-center gap-md px-lg py-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 rounded-lg scale-95 active:scale-90 transition-transform"
          href="#"
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-body-md text-body-md">Transactions</span>
        </a>
        <a
          className="flex items-center gap-md px-lg py-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200 rounded-lg scale-95 active:scale-90 transition-transform"
          href="#"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md text-body-md">Settings</span>
        </a>
      </div>
      <div className="px-xl mt-auto">
        <div className="flex items-center gap-md pt-lg border-t border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant">
            <span className="material-symbols-outlined text-on-surface-variant">
              account_circle
            </span>
          </div>
          <div>
            <div className="font-label-md text-label-md text-on-surface">
              Marcus Chen
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Customer
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
