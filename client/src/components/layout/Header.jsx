import React from "react";

export default function Header() {
  return (
    <header className="bg-[#0F172A] border-b border-outline-variant h-[64px] px-container-padding w-full z-50 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center font-bold text-on-primary-container font-headline-sm">
          DG
        </div>
        <h1 className="font-headline-md text-headline-md font-bold text-primary">
          DG Command Center
        </h1>
      </div>
      <div className="hidden md:flex flex-1 justify-center">
        <nav className="flex gap-8">
          <a
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors hover:opacity-80 duration-150"
            href="#"
          >
            Assortment
          </a>
          <a
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors hover:opacity-80 duration-150"
            href="#"
          >
            Pricing
          </a>
          <a
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors hover:opacity-80 duration-150"
            href="#"
          >
            Inventory
          </a>
          <a
            className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors hover:opacity-80 duration-150"
            href="#"
          >
            Suppliers
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
        <img
          alt="Category Manager Profile"
          className="w-8 h-8 rounded-full object-cover border border-outline-variant"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp3LVNj1oQaIuEQfXn4FFBH0OCWhXeXt2TrJcf6Z9Lz0Pvb0HszVp2OaJ4yXeJ2aXUKAEZTjl2ZZJ8zO5SOre615n4N2MiuU3TkNxskp3zeiZ2FLt5Y-QsjiEu1oYWAuaCQivLF0-OPvIsZW55OSlr8qRgnUQ8PNS06GUnNymRZ3HVxTyzD2P79tpQWjCTc1xeyFmObkP_VNDfw21XqYRwGktceV58Ryj8v9-MO7I3Dhn6-kW_ks1ZYVNg6gmmt5OWrTXE8MsTWvI"
        />
      </div>
    </header>
  );
}
