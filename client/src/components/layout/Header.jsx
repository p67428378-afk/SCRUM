import React from "react";

export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <header className="fixed top-0 right-0 h-[64px] left-[260px] bg-surface border-b border-outline-variant flex justify-between items-center px-6 z-10 transition-all duration-200 ease-in-out">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            className="w-full bg-[#0F172A] border border-[#334155] rounded-lg py-2 pl-10 pr-4 text-on-surface font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-on-surface-variant"
            placeholder="Search export jobs..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error rounded-full flex items-center justify-center font-label-md text-[10px] font-bold">
            1
          </span>
        </button>
        <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer active:scale-95 transition-transform">
          <img
            className="w-full h-full object-cover"
            alt="User Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCz6wpGBF8sRnfpH2JELoXDmMnYjx6ZAu4YrrC0lGzhTgN5YDV7aoVKUNZAzJd0NxlZNcivKBCMOy_kieEt1lm63vvN0DnnJJ1hFd0bkeRBkiVGF1tsbKzlbyC5DYIHBm3ppbkVj25E2WZsBbYTT1TDtYs-_2fUSpATW9rjVQ0WejAGY6qt5l9CZPMNqQ_9aFRp_vj47ebiNmHCDQw7eHf55z8eiKW2oFIAtrpYgqRxwrFBXXVCTPNTMPCLVW7uNp8sltYk9tZ919Pt"
          />
        </div>
      </div>
    </header>
  );
}
