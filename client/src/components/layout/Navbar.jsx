import React from "react";
import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../common/Badge";
import { LogOut, User, CheckSquare } from "lucide-react";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation"
          >
            <span className="sr-only">Toggle Sidebar</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
        <Link
          to="/projects"
          className="flex items-center gap-2 text-blue-600 font-bold text-lg hover:opacity-90 transition-opacity"
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-slate-900 font-semibold tracking-tight">
            TeamFlow
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-900">
                {user.full_name}
              </span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <Badge label={user.role} variant={user.role} />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

Navbar.propTypes = {
  onToggleSidebar: PropTypes.func,
};

export default Navbar;
