import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Film, Tv, Shield, User, LogOut, Key } from "lucide-react";
import { authApi } from "../../services/api";

export default function Navbar({ onSearchChange, searchQuery = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(authApi.getCurrentRole());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [loginRole, setLoginRole] = useState("user");
  const [loginError, setLoginError] = useState("");

  const toggleRole = () => {
    const newRole = role === "admin" ? "user" : "admin";
    localStorage.setItem("role", newRole);
    setRole(newRole);
    if (newRole === "admin" && location.pathname !== "/admin/dashboard") {
      navigate("/admin/dashboard");
    } else if (newRole === "user" && location.pathname === "/admin/dashboard") {
      navigate("/");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      await authApi.login(email, password);
      localStorage.setItem("role", loginRole);
      setRole(loginRole);
      setShowLoginModal(false);
      if (loginRole === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.warn(
        "API login failed, applying mock session for local dev",
        err,
      );
      localStorage.setItem("token", "mock-jwt-token");
      localStorage.setItem("role", loginRole);
      setRole(loginRole);
      setShowLoginModal(false);
      if (loginRole === "admin") {
        navigate("/admin/dashboard");
      }
    }
  };

  return (
    <header className="bg-[#1e2020] border-b border-gray-800 sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-8 w-full md:w-auto justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-wider text-[#1a98ff] flex items-center gap-2"
          >
            <span>PRIME VIDEO</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`flex items-center gap-1.5 transition ${
                location.pathname === "/"
                  ? "text-[#1a98ff] font-bold"
                  : "text-[#bfc7d1] hover:text-white"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
            {role === "admin" && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 transition ${
                  location.pathname.startsWith("/admin")
                    ? "text-[#1a98ff] font-bold"
                    : "text-[#bfc7d1] hover:text-white"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search movies, series, cast..."
              className="w-full bg-[#121414] text-sm text-white pl-9 pr-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-[#1a98ff] transition"
            />
          </div>

          <button
            onClick={toggleRole}
            className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-[#a1c9ff] hover:bg-gray-700 transition"
            title="Toggle viewer or administrator mode"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {role.toUpperCase()}</span>
          </button>

          <button
            onClick={() => setShowLoginModal(true)}
            className="p-2 rounded-full bg-gray-800 text-[#bfc7d1] hover:text-white hover:bg-gray-700 transition"
            title="Account Login"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e2020] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-[#1a98ff]" />
                Platform Login
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#121414] p-3 rounded-lg text-xs text-[#a1c9ff] mb-4 border border-blue-900/40">
              <p className="font-semibold mb-1">
                Test Credentials (Pre-filled):
              </p>
              <p>
                Email:{" "}
                <code className="text-white font-mono">test@example.com</code>
              </p>
              <p>
                Password:{" "}
                <code className="text-white font-mono">testpassword</code>
              </p>
              <p className="mt-1 text-gray-400">
                Admin login:{" "}
                <code className="text-white font-mono">admin@example.com</code>
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#bfc7d1] mb-1">
                  Select Active Role
                </label>
                <select
                  value={loginRole}
                  onChange={(e) => setLoginRole(e.target.value)}
                  className="w-full bg-[#121414] border border-gray-700 rounded p-2.5 text-sm text-white focus:border-[#1a98ff] focus:outline-none"
                >
                  <option value="user">Platform Viewer (User)</option>
                  <option value="admin">Content Administrator (Admin)</option>
                </select>
              </div>

              {loginError && (
                <p className="text-xs text-[#f87171]">{loginError}</p>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded text-sm font-semibold text-white bg-[#1a98ff] hover:bg-[#a1c9ff] hover:text-[#121414] transition"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
