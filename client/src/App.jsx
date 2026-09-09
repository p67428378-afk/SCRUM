import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { Leaf, Layers, ShoppingBag, BookOpen, User } from "lucide-react";
import InventoryPage from "./pages/InventoryPage";
import PosPage from "./pages/PosPage";
import RecipesPage from "./pages/RecipesPage";

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Inventory Dashboard", icon: Layers },
    { path: "/pos", label: "POS Entry Portal", icon: ShoppingBag },
    { path: "/recipes", label: "Recipes & Quality", icon: BookOpen },
  ];

  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2.5 font-bold text-lg tracking-tight text-white hover:text-emerald-200 transition"
        >
          <div className="p-1.5 bg-emerald-700 rounded-lg">
            <Leaf className="w-5 h-5 text-emerald-200" />
          </div>
          <span>ZenTea Management</span>
        </Link>

        {/* Route Links */}
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-800 text-white shadow-xs border border-emerald-700"
                    : "text-emerald-100 hover:bg-emerald-850 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info / Staff Badge */}
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="flex items-center space-x-2 bg-emerald-800 px-3 py-1.5 rounded-full border border-emerald-700 text-emerald-100">
            <User className="w-3.5 h-3.5" />
            <span>Staff Account</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navigation />

        {/* Test Credential Notice Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2 text-center text-xs text-emerald-900 font-medium">
          ☕ <span className="font-bold">Test Account Credentials:</span>{" "}
          test@example.com / testpassword &bull; ZenTea Automated Inventory &
          POS Portal
        </div>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<InventoryPage />} />
            <Route path="/pos" element={<PosPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
          ZenTea Management System &copy; {new Date().getFullYear()} &bull;
          Built with React 18, Vite & Tailwind CSS
        </footer>
      </div>
    </BrowserRouter>
  );
}
