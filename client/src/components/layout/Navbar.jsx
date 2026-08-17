import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";
import { authApi } from "../../services/api";

export default function Navbar({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "My History", path: "/history" },
    { name: "Team Approvals", path: "/approvals", roles: ["Manager", "Admin"] },
    { name: "Audit Logs", path: "/audit-logs", roles: ["Admin"] },
  ];

  const userRole = currentUser?.role || "Employee";
  const filteredLinks = navLinks.filter(
    (link) => !link.roles || link.roles.includes(userRole),
  );

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white border-b border-[#e3e8f0] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-8">
        <Link
          to="/"
          className="text-[#2663eb] text-xl font-bold tracking-tight hover:opacity-90"
        >
          Attendance Hub
        </Link>
        <div className="flex items-center space-x-6">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#2663eb] font-semibold border-b-2 border-[#2663eb] pb-1"
                    : "text-[#707a8c] hover:text-[#171c29]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          className="text-[#707a8c] hover:text-[#171c29] p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pl-2 border-l border-gray-200">
          <div className="bg-[#2663eb] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm">
            {getInitials(currentUser?.full_name)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-[#171c29]">
              {currentUser?.full_name || "User"}
            </div>
            <div className="text-[#707a8c] uppercase text-[10px] tracking-wider">
              {userRole}
            </div>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="text-[#707a8c] hover:text-[#dc2626] p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
