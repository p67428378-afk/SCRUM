import React from "react";

export default function Sidebar() {
  return (
    <aside class="docked h-screen w-[260px] left-0 top-0 fixed flex flex-col justify-between py-6 bg-on-background z-50">
      <div>
        <div class="px-container-padding mb-8">
          <h1 class="font-display-lg text-display-lg font-black text-primary-container leading-none">
            DG
          </h1>
          <p class="font-label-caps text-label-caps text-surface-container-high mt-1 uppercase tracking-wider">
            Assortment Advisor
          </p>
        </div>
        <nav class="flex flex-col">
          <a
            class="flex items-center gap-stack-md px-container-padding py-cell-padding-y bg-inverse-surface text-primary-container border-l-4 border-primary-container duration-150"
            href="#"
          >
            <span class="material-symbols-outlined">dashboard</span>
            <span class="font-label-caps text-label-caps ml-2">Dashboard</span>
          </a>
          <a
            class="flex items-center gap-stack-md px-container-padding py-cell-padding-y text-on-secondary-fixed-variant hover:bg-inverse-surface hover:text-primary-container transition-colors"
            href="#"
          >
            <span class="material-symbols-outlined">inventory_2</span>
            <span class="font-label-caps text-label-caps ml-2">Products</span>
          </a>
          <a
            class="flex items-center gap-stack-md px-container-padding py-cell-padding-y text-on-secondary-fixed-variant hover:bg-inverse-surface hover:text-primary-container transition-colors"
            href="#"
          >
            <span class="material-symbols-outlined">analytics</span>
            <span class="font-label-caps text-label-caps ml-2">Scenarios</span>
          </a>
          <a
            class="flex items-center gap-stack-md px-container-padding py-cell-padding-y text-on-secondary-fixed-variant hover:bg-inverse-surface hover:text-primary-container transition-colors"
            href="#"
          >
            <span class="material-symbols-outlined">history</span>
            <span class="font-label-caps text-label-caps ml-2">History</span>
          </a>
          <a
            class="flex items-center gap-stack-md px-container-padding py-cell-padding-y text-on-secondary-fixed-variant hover:bg-inverse-surface hover:text-primary-container transition-colors"
            href="#"
          >
            <span class="material-symbols-outlined">settings</span>
            <span class="font-label-caps text-label-caps ml-2">Settings</span>
          </a>
        </nav>
      </div>
      <div class="px-container-padding">
        <a
          class="flex items-center gap-stack-md py-cell-padding-y text-on-secondary-fixed-variant hover:text-primary-container transition-colors"
          href="#"
        >
          <span class="material-symbols-outlined">help</span>
          <span class="font-label-caps text-label-caps ml-2">Support</span>
        </a>
        <div class="mt-6 flex items-center gap-3 bg-inverse-surface p-3 rounded-lg border border-tertiary/20">
          <img
            alt="John Doe"
            class="w-10 h-10 rounded-full object-cover border border-surface-container-high"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiACZxQ8vRJq3iYUMXSM0fKvsLWvkKYrkelhQniQGbRoAJN897eKJDYtTUcwrDV0IdvEqwe68dH6O91qcT_PHSS1QuIJxCExiJpt_0QiahkctXcLFjoyQFhU0511vTHtrjSKRxBIu2rbg3Os2_jG9ChUVcgDKeNLDGu1eFAxuRCotAyskIqeDva2q6ZEz5tQTkQ4I1Xxd0CVB0G4C2aktDqDi4e4SVG96BhdLXhi28H0zczG_arDccAF84bPM3tpQhGBGn2kQNxops"
          />
          <div>
            <p class="font-data-tabular text-data-tabular text-on-primary">
              John Doe
            </p>
            <p class="font-label-caps text-label-caps text-surface-container-highest">
              Category Manager
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
