import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ShoppingCart,
  User,
  LogOut,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Navbar({
  user,
  cartCount = 0,
  onOpenAuth,
  onLogout,
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      navigate(`/?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-brand-950 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 flex-shrink-0 group"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-wide text-white">
                Book Haven
              </span>
              <span className="hidden sm:block text-[10px] text-slate-300 uppercase tracking-widest font-sans">
                Curated Books & Literature
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Title, Author, ISBN..."
                value={searchQuery}
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/60 border border-slate-700 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Right Navigation / Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-slate-200 hover:text-accent font-medium text-sm transition-colors"
            >
              Catalog
            </Link>

            {user ? (
              <Link
                to="/account"
                className="text-slate-200 hover:text-accent font-medium text-sm flex items-center space-x-1 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Orders</span>
              </Link>
            ) : null}

            {/* Shopping Cart Button */}
            <Link
              to="/checkout"
              className="relative p-2 text-slate-200 hover:text-accent flex items-center transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="bg-accent text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1 shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-700">
                <Link
                  to="/account"
                  className="flex items-center space-x-2 text-sm text-slate-200 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-accent text-xs">
                    {user.full_name
                      ? user.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth("login")}
                className="bg-accent hover:bg-accent-hover text-slate-950 font-bold text-xs uppercase px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link
              to="/checkout"
              className="relative p-2 text-slate-200 hover:text-accent"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="bg-accent text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              aria-label="Toggle menu"
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
        <div className="md:hidden border-t border-slate-800 bg-brand-950 px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Title, Author, ISBN..."
                value={searchQuery}
                onChange={(e) =>
                  onSearchChange && onSearchChange(e.target.value)
                }
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400"
              />
            </div>
          </form>
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800 font-medium text-sm"
            >
              Catalog
            </Link>
            {user && (
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800 font-medium text-sm"
              >
                Orders & Account
              </Link>
            )}
            <Link
              to="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-slate-200 hover:bg-slate-800 font-medium text-sm flex justify-between items-center"
            >
              <span>Shopping Cart</span>
              <span className="bg-accent text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            </Link>
            <div className="pt-2 border-t border-slate-800">
              {user ? (
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-sm text-slate-300">
                    {user.full_name}
                  </span>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-2 bg-accent text-slate-950 font-bold py-2 rounded-lg text-sm"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    full_name: PropTypes.string,
    role: PropTypes.string,
  }),
  cartCount: PropTypes.number,
  onOpenAuth: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  onSearchSubmit: PropTypes.func,
};
