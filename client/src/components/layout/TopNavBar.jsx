import React from "react";

export default function TopNavBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding h-16 bg-inverse-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-primary-container text-on-primary-container font-headline-md font-extrabold w-10 h-10 flex items-center justify-center rounded flex-shrink-0">
          DG
        </div>
        <h1 className="text-headline-md font-headline-md font-extrabold text-on-secondary hidden md:block">
          DG Cluster Assortment Advisor
        </h1>
        <span className="bg-primary-container text-on-primary-container text-label-caps font-label-caps px-2 py-1 rounded ml-4 border border-primary-fixed-dim/30 hidden lg:inline-block">
          Small Town Value Cluster
        </span>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex gap-6 h-full items-center">
          <a
            className="text-on-secondary-variant hover:text-on-secondary transition-colors text-body-sm"
            href="#"
          >
            Dashboard
          </a>
          <a
            className="text-primary-container border-b-2 border-primary-container pb-1 font-bold h-16 flex items-center text-body-sm"
            href="#"
          >
            Assortment
          </a>
          <a
            className="text-on-secondary-variant hover:text-on-secondary transition-colors text-body-sm"
            href="#"
          >
            Analytics
          </a>
          <a
            className="text-on-secondary-variant hover:text-on-secondary transition-colors text-body-sm"
            href="#"
          >
            Strategy
          </a>
        </nav>
        <div className="flex items-center gap-4 border-l border-outline/30 pl-6 ml-2">
          <button className="text-on-secondary hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-body-sm font-semibold text-on-secondary">
                Jane Doe
              </span>
              <span className="text-label-caps font-label-caps text-on-secondary/70">
                Category Manager - Snacks
              </span>
            </div>
            <img
              alt="User Profile"
              className="w-9 h-9 rounded-full object-cover border-2 border-primary-container shadow-sm"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuArDQOsM1ZVhCn4V7EjobI703zlFQax-GP-D4HRfCrdE732-DJhIB9XIhOOEW0s1rQoqg9ugj5Mz8o_iejiNqiJAdc14hzBMUOIUbdf5D50YjFhb7_NUFC4Kt_kmpDG2LwqFjRaDhSXwLYll7KCFQTqgqKrH0uYsBWOEWT33L0bTdeD3DMyRsIMqxYMiGemXnyeEddaksAly-tWkgmOwPAt4axmmzNPGdol29mDsr8i58otG9lAHHsCO54u6CwsqL6ofI_em8etA5Y"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
