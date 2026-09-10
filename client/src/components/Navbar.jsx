import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginModal } from "./LoginModal";
import { BookOpen, User, LogOut, Shield, LogIn } from "lucide-react";

export const Navbar = () => {
  const { user, member, isAuthenticated, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const getNavClass = ({ isActive }) =>
    isActive
      ? "text-indigo-400 font-semibold border-b-2 border-indigo-400 pb-1 flex items-center gap-1.5"
      : "text-slate-300 hover:text-white transition-colors pb-1 flex items-center gap-1.5";

  return (
    <>
      <header className="bg-[#0F172A] text-white px-6 py-4 sticky top-0 z-40 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-indigo-600 rounded-xl group-hover:bg-indigo-500 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">
                BiblioCentral Library
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" end className={getNavClass}>
              Catalog Search
            </NavLink>
            <NavLink to="/my-loans" className={getNavClass}>
              My Loans
            </NavLink>
            <NavLink to="/circulation" className={getNavClass}>
              Staff Circulation
            </NavLink>
            <NavLink to="/management" className={getNavClass}>
              Inventory & Members
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
                    {user?.role !== "PATRON" && (
                      <Shield className="w-3 h-3 text-amber-400" />
                    )}
                    {user?.full_name || user?.email}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    <span className="uppercase font-mono text-indigo-400">
                      {user?.role}
                    </span>
                    {member?.membership_tier && (
                      <span className="text-emerald-400">
                        • {member.membership_tier}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-indigo-400/30">
                  {user?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-xl font-medium text-xs hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};
