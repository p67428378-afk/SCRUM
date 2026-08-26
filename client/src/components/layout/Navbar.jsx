import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Tags,
  Menu,
  X,
  User,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ReceiptText },
    { name: "Categories", path: "/categories", icon: Tags },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <NavLink
              to="/"
              className="flex items-center gap-2.5 text-[#171C29]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#2663EB] flex items-center justify-center text-white shadow-md">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-[#171C29]">
                  Expense<span className="text-[#2663EB]">Tracker</span>
                </span>
                <span className="text-[11px] font-medium text-[#707A8C]">
                  Personal Budget Manager
                </span>
              </div>
            </NavLink>

            <nav className="hidden md:flex ml-10 space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-[#2663EB]"
                          : "text-[#707A8C] hover:text-[#171C29] hover:bg-gray-100"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#2663EB] font-semibold text-sm">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#171C29]">
                  Demo User
                </span>
                <span className="text-[11px] text-[#707A8C]">
                  user@example.com
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-md text-[#707A8C] hover:text-[#171C29] hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive
                      ? "bg-blue-50 text-[#2663EB]"
                      : "text-[#707A8C] hover:text-[#171C29] hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
