import React from "react";

export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <header class="fixed top-0 left-[260px] right-0 z-40 flex justify-between items-center px-container-padding h-[64px] bg-surface-container-lowest border-b border-outline-variant">
      <div class="flex items-center gap-6">
        <h2 class="font-headline-md text-headline-md font-bold text-on-surface">
          Small Town Value Cluster — Snacks Assortment
        </h2>
        <div class="hidden lg:flex items-center gap-6 ml-6">
          <a
            class="font-title-sm text-title-sm text-secondary hover:text-primary transition-all"
            href="#"
          >
            Cluster Overview
          </a>
          <a
            class="font-title-sm text-title-sm text-primary font-bold border-b-2 border-primary pb-1"
            href="#"
          >
            SKU Analysis
          </a>
          <a
            class="font-title-sm text-title-sm text-secondary hover:text-primary transition-all"
            href="#"
          >
            Impact Review
          </a>
        </div>
      </div>
      <div class="flex items-center gap-stack-md">
        <div class="relative hidden md:block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">
            search
          </span>
          <input
            class="pl-10 pr-4 py-2 bg-surface rounded-md border border-outline-variant font-body-sm text-body-sm focus:ring-2 focus:ring-primary-container focus:ring-offset-2 outline-none w-64"
            placeholder="Search SKUs..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button class="relative p-2 text-secondary hover:text-primary transition-colors">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button class="p-2 text-secondary hover:text-primary transition-colors">
          <span class="material-symbols-outlined">apps</span>
        </button>
      </div>
    </header>
  );
}
