import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Heart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getWishlist } from "../../services/api";

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchWishlistCount = async () => {
      if (user) {
        try {
          const items = await getWishlist();
          if (isMounted && Array.isArray(items)) {
            setWishlistCount(items.length);
          }
        } catch (err) {
          console.error("Failed to fetch wishlist count", err);
        }
      } else {
        if (isMounted) setWishlistCount(0);
      }
    };
    fetchWishlistCount();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-white border-b border-[#e3e8f0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="font-bold text-xl text-[#2663eb] tracking-wide flex items-center gap-2"
            >
              THREAD &amp; STYLE
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#171c29]">
              <Link to="/" className="hover:text-[#2663eb] transition-colors">
                All Products
              </Link>
              <Link
                to="/?category=clothing"
                className="hover:text-[#2663eb] transition-colors"
              >
                Clothing
              </Link>
              <Link
                to="/?category=accessories"
                className="hover:text-[#2663eb] transition-colors"
              >
                Accessories
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex flex-1 max-w-md mx-6 relative"
          >
            <input
              type="text"
              placeholder="Search clothes &amp; accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-full py-1.5 pl-10 pr-4 text-sm text-[#171c29] focus:outline-none focus:ring-2 focus:ring-[#2663eb]"
            />
            <Search className="w-4 h-4 text-[#707a8c] absolute left-3 top-2.5" />
          </form>

          {/* Right Actions: Wishlist, Cart & User */}
          <div className="flex items-center gap-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2 text-[#171c29] hover:text-[#2663eb] transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#2663eb] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 text-[#171c29] hover:text-[#2663eb] transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#2663eb] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Login */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/orders"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#171c29] hover:text-[#2663eb]"
                >
                  <Package className="w-4 h-4 text-[#707a8c]" />
                  <span>Orders</span>
                </Link>
                <div className="h-4 w-px bg-[#e3e8f0]"></div>
                <span className="text-sm font-medium text-[#171c29]">
                  {user.full_name || user.email}
                </span>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 text-[#707a8c] hover:text-[#db2626] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#2663eb] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#171c29] hover:text-[#2663eb]"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#e3e8f0] bg-white px-4 pt-2 pb-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <input
              type="text"
              placeholder="Search clothes &amp; accessories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f7fafc] border border-[#e3e8f0] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#707a8c] absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col gap-2 pt-2 text-sm font-medium text-[#171c29]">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1 hover:text-[#2663eb]"
            >
              All Products
            </Link>
            <Link
              to="/?category=clothing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1 hover:text-[#2663eb]"
            >
              Clothing
            </Link>
            <Link
              to="/?category=accessories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1 hover:text-[#2663eb]"
            >
              Accessories
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1 hover:text-[#2663eb] flex items-center justify-between"
            >
              <span>My Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-[#2663eb] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1 hover:text-[#2663eb]"
                >
                  My Order History
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left py-1 text-[#db2626] font-medium"
                >
                  Sign Out ({user.email})
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-block text-center bg-[#2663eb] text-white py-2 rounded-lg font-medium"
              >
                Sign In / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
