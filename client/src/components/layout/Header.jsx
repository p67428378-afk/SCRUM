import React from "react";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-[280px] z-40 flex items-center justify-between px-gutter bg-surface h-[64px] border-b border-outline-variant">
      <div className="flex items-center gap-4">
        <div className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-xl">
          DG
        </div>
        <h1 className="font-headline-md text-headline-md font-black text-on-surface truncate hidden sm:block">
          DG Cluster Assortment Advisor
        </h1>
      </div>
      <div className="flex-1 max-w-xl mx-8 hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        <span
          className="material-symbols-outlined text-on-surface-variant mr-2"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          search
        </span>
        <input
          className="bg-transparent border-none outline-none w-full text-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0"
          placeholder="Search Assortment..."
          type="text"
        />
      </div>
      <nav className="hidden md:flex gap-6 items-center">
        <a
          className="text-primary font-bold border-b-2 border-primary pb-1 h-full flex items-center text-label-md hover:text-primary transition-colors"
          href="#"
        >
          Dashboard
        </a>
        <a
          className="text-on-surface-variant text-label-md hover:text-primary transition-colors h-full flex items-center pb-1 border-b-2 border-transparent"
          href="#"
        >
          Inventory
        </a>
        <a
          className="text-on-surface-variant text-label-md hover:text-primary transition-colors h-full flex items-center pb-1 border-b-2 border-transparent"
          href="#"
        >
          Strategy
        </a>
      </nav>
      <div className="flex items-center gap-4 ml-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            notifications
          </span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-high">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            settings
          </span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img
            alt="Administrator profile"
            className="w-8 h-8 rounded-full border border-outline-variant object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUXg_MysNsUVDpn20YCgZFNfJucLN_28FWGtcEecY7u_xfoP9C8OBXm791uG5A-T06miAKxmsTFQ15VBk-K-WTkdOzvsZDzamf_Uy78PQVDGR6zW7NLlhnrMhLKpWrcamIypGObT0TgvJPHmzOWmcHxXXnPX8cqe2G8uQwsPlZGtFhNn0wEbk0YEp43dAkTzuX-6u5gcpPtvT7fXzYF8BFiT1jnu1fhssTv5Kr5lfxddU8SlpBazd0eeLXjeeLPYaGdz-CkJr8-Kbs"
          />
        </div>
      </div>
    </header>
  );
}
