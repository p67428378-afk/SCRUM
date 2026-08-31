import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { FolderKanban, CheckSquare, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: "Projects", path: "/projects", icon: FolderKanban },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-100 hidden md:block">
          <div className="flex items-center gap-2 px-2 py-1.5 text-blue-600 font-bold">
            <CheckSquare className="w-5 h-5" />
            <span className="text-slate-900 text-base font-semibold">
              Workspace
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              {isAdmin && <ShieldCheck className="w-4 h-4 text-purple-600" />}
              <span className="font-medium text-slate-700">
                Role: {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Logged in as {user.email}
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
