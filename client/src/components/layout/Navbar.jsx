import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  BookMarked,
  Settings,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

export const Navbar = () => {
  const { user, logout, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight"
            >
              <BookOpen className="h-6 w-6" />
              <span>LibSys</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/catalog"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/catalog") || isActive("/")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <BookOpen size={16} />
                <span>Catalog</span>
              </Link>

              {user && (
                <Link
                  to="/my-loans"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/my-loans")
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <BookMarked size={16} />
                  <span>My Loans</span>
                </Link>
              )}

              {isLibrarian && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Settings size={16} />
                  <span>Librarian Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs text-slate-700 font-medium">
                  {isLibrarian ? (
                    <ShieldCheck size={14} className="text-purple-600" />
                  ) : (
                    <User size={14} className="text-blue-600" />
                  )}
                  <span>{user.full_name || user.email}</span>
                  <span className="text-slate-400">({user.role})</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
