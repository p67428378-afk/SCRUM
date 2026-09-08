import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { loginUser } from "../../services/api";

export default function TopNavBar({ currentUser, onUserChange }) {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Directory", path: "/directory" },
    { label: "Facilities", path: "/facilities" },
    { label: "Announcements", path: "/announcements" },
    { label: "Service Requests", path: "/service-requests" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      if (data && onUserChange) {
        onUserChange(
          data.user || { email, full_name: "Test Resident", role: "Resident" },
        );
      }
      setShowLoginModal(false);
    } catch (err) {
      setLoginError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onUserChange) {
      onUserChange(null);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Brand */}
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            className="text-xl font-bold text-blue-400 flex items-center gap-2"
          >
            <span>🏡</span> VillageOS
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Actions */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {currentUser.full_name
                  ? currentUser.full_name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-white leading-none">
                  {currentUser.full_name || currentUser.email}
                </div>
                <div className="text-blue-400 text-[10px] uppercase font-bold mt-0.5">
                  {currentUser.role || "Resident"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-red-400 ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-900 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Sign In to
                VillageOS
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Test Credentials Note (Mandatory) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 mb-4">
              <span className="font-bold">Test Account Credentials:</span>
              <br />
              Email:{" "}
              <code className="bg-blue-100 px-1 rounded">test@example.com</code>
              <br />
              Password:{" "}
              <code className="bg-blue-100 px-1 rounded">testpassword</code>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-4">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 border rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
