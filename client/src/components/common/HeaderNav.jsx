import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Mail, Sparkles } from "lucide-react";

export default function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Home & Bio", path: "/" },
    { name: "Media Gallery", path: "/gallery" },
    { name: "Filmography", path: "/credits" },
    { name: "Contact & Booking", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0F131C]/90 backdrop-blur-md border-b border-[#F59E0B]/20 px-4 sm:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo / Wordmark */}
        <NavLink to="/" className="flex items-center gap-2 group">
          <Sparkles className="w-5 h-5 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
          <span className="font-serif text-2xl font-bold tracking-widest text-[#F59E0B] group-hover:text-amber-400 transition-colors">
            ELENA VANCE
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "text-[#F59E0B] border-b-2 border-[#F59E0B] pb-1 font-semibold transition-all"
                  : "text-[#9CA3AF] hover:text-white transition-colors pb-1"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Contact Agent CTA Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => navigate("/contact")}
            className="bg-[#F59E0B] text-[#0A0E17] px-5 py-2 rounded-md font-semibold text-sm hover:bg-[#D97706] transition-colors flex items-center gap-2 shadow-lg shadow-[#F59E0B]/10 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Agent</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden text-[#9CA3AF] hover:text-white p-2 rounded-md bg-[#181B25] border border-white/10"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 pb-2 animate-fadeIn">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "text-[#F59E0B] bg-[#181B25] px-4 py-2 rounded-md font-semibold"
                  : "text-[#9CA3AF] hover:text-white px-4 py-2 rounded-md hover:bg-[#181B25]"
              }
            >
              {item.name}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate("/contact");
            }}
            className="w-full bg-[#F59E0B] text-[#0A0E17] py-2.5 rounded-md font-bold text-sm hover:bg-[#D97706] mt-2 flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Agent</span>
          </button>
        </div>
      )}
    </header>
  );
}
