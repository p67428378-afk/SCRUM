import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Film,
  User,
  Image,
  Award,
  ExternalLink,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar({
  actorSlug = "john-doe",
  activeSection,
  onNavigateSection,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { id: "profile", label: "Profile & Bio", icon: User },
    { id: "media", label: "Media & Headshots", icon: Image },
    { id: "credits", label: "Filmography Credits", icon: Award },
  ];

  const handleNavClick = (sectionId) => {
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      navigate("/dashboard");
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#111319] border-b border-[#1a1d26] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f2ca50] to-[#d4af37] p-0.5 shadow-lg shadow-[#f2ca50]/10">
                <div className="w-full h-full bg-[#0b0e13] rounded-[7px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                  <Film className="w-5 h-5 text-[#f2ca50] group-hover:text-[#0b0e13] transition-colors" />
                </div>
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#e1e2e9] font-sans">
                  Spotlight<span className="text-[#f2ca50]">Portfolio</span>
                </span>
                <span className="block text-[10px] text-[#d0c5af] font-mono leading-none">
                  ACTOR ROSTER SYSTEM
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/20"
                      : "text-[#d0c5af] hover:text-[#e1e2e9] hover:bg-[#1a1d26]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to={`/actors/${actorSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#0b0e13] font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-[#f2ca50]/20"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Portfolio
            </Link>

            <div className="w-9 h-9 rounded-full bg-[#1a1d26] border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] font-bold text-xs">
              JD
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#d0c5af] hover:text-[#e1e2e9] hover:bg-[#1a1d26]"
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

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111319] border-b border-[#1a1d26] px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-[#d0c5af] hover:text-[#f2ca50] hover:bg-[#1a1d26]"
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#1a1d26]">
            <Link
              to={`/actors/${actorSlug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#f2ca50] text-[#0b0e13] font-semibold text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Portfolio
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
