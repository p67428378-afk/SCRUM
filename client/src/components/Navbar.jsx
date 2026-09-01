import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, List, LogIn, LogOut, BarChart3 } from "lucide-react";
import { authApi } from "../services/api";

export default function Navbar({ favoritesCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [fullName, setFullName] = useState("Test User");
  const [role, setRole] = useState("buyer");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      if (isRegistering) {
        const data = await authApi.register({
          email,
          password,
          full_name: fullName,
          role,
        });
        setCurrentUser(data.user);
      } else {
        const data = await authApi.login(email, password);
        setCurrentUser(data.user);
      }
      setShowLoginModal(false);
    } catch (err) {
      console.error("Auth error", err);
      setAuthError(
        err.response?.data?.detail ||
          "Authentication failed. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    navigate("/search");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-slate-900 text-white px-6 lg:px-8 py-4 flex items-center justify-between shadow-md border-b border-slate-800">
      <div className="flex items-center space-x-6">
        <Link
          to="/search"
          className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-blue-400"
        >
          <Home className="w-7 h-7 text-blue-500" />
          <span>HomeFinder</span>
        </Link>
        <nav className="flex space-x-4 text-sm font-medium text-slate-300">
          <Link
            to="/search"
            className={`flex items-center space-x-1 py-1 transition ${
              isActive("/search")
                ? "text-white border-b-2 border-blue-500 font-semibold"
                : "hover:text-white"
            }`}
          >
            <span>Search</span>
          </Link>
          <Link
            to="/analytics"
            className={`flex items-center space-x-1 py-1 transition ${
              isActive("/analytics")
                ? "text-white border-b-2 border-blue-500 font-semibold"
                : "hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>CMA Analytics</span>
          </Link>
          <Link
            to="/favorites"
            className={`flex items-center space-x-1 py-1 transition ${
              isActive("/favorites")
                ? "text-white border-b-2 border-blue-500 font-semibold"
                : "hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {favoritesCount}
              </span>
            )}
          </Link>
          <Link
            to="/manage-listings"
            className={`flex items-center space-x-1 py-1 transition ${
              isActive("/manage-listings")
                ? "text-white border-b-2 border-blue-500 font-semibold"
                : "hover:text-white"
            }`}
          >
            <List className="w-4 h-4 text-blue-400" />
            <span>My Listings</span>
          </Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {currentUser ? (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium text-slate-200">
                {currentUser.full_name || currentUser.email}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {currentUser.role || "User"}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm shadow">
              {(currentUser.full_name || currentUser.email || "U")
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 text-slate-900 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                {isRegistering ? "Create Account" : "Sign In"}
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg p-3 mb-4">
              <strong>Test Account:</strong> test@example.com / testpassword
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg p-3 mb-4">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="buyer">Buyer/Renter</option>
                      <option value="agent">Seller/Agent</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition shadow"
              >
                {loading
                  ? "Processing..."
                  : isRegistering
                    ? "Register"
                    : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              {isRegistering
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 font-semibold hover:underline"
              >
                {isRegistering ? "Sign In" : "Register now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
