import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-lg ${
      isActive
        ? "bg-primary-container text-on-primary-container scale-[0.98]"
        : "text-on-surface-variant hover:text-on-surface hover:bg-secondary-container"
    }`;

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant flex flex-col justify-between p-4 z-30">
      <div>
        <div className="px-4 py-6 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              diamond
            </span>
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
              AuraJewel
            </h1>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Jewelry Management
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <NavLink to="/" end className={linkClass}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </NavLink>
          <NavLink to="/inventory" className={linkClass}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md text-label-md">Inventory</span>
          </NavLink>
        </div>
      </div>
      <div className="mt-auto border-t border-outline-variant pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-secondary-container transition-colors duration-200 rounded-lg">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md text-label-md">Logout</span>
        </button>
      </div>
    </nav>
  );
}
