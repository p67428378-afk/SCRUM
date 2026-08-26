import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Sofa,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, wishlist, notification } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    { name: "All Furniture", path: "/catalog" },
    { name: "Living Room", path: "/catalog?category=living-room" },
    { name: "Bedroom", path: "/catalog?category=bedroom" },
    { name: "Office", path: "/catalog?category=office" },
    { name: "Dining", path: "/catalog?category=dining" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-borderline shadow-sm">
      {/* Top Banner */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span>✨ Free White-Glove Delivery on orders over $1,000</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">
          Use code{" "}
          <strong className="text-accent font-bold">FURNITURE20</strong> for 20%
          off
        </span>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-primary group">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow group-hover:bg-primary-hover transition-colors">
              <Sofa className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-primary">
                FurniCraft
              </span>
              <span className="block text-[10px] text-textmuted -mt-1 font-medium uppercase tracking-wider">
                Fine Home Furnishings
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.map((cat) => {
              const isActive =
                location.pathname === "/catalog" &&
                ((cat.path === "/catalog" && !location.search) ||
                  location.search.includes(cat.path.split("?")[1] || "____"));
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive
                      ? "text-primary font-semibold border-b-2 border-primary pb-0.5"
                      : "text-textmuted"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Wishlist Link */}
            <Link
              to="/orders?tab=wishlist"
              className="p-2 text-textmuted hover:text-primary hover:bg-bgsoft rounded-full transition-colors relative"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2 text-textmuted hover:text-primary hover:bg-bgsoft rounded-full transition-colors relative"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth / Account Profile */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-borderline">
                <Link
                  to="/orders"
                  className="flex items-center gap-1.5 text-xs font-medium text-textmain hover:text-primary py-1 px-2.5 rounded-md hover:bg-bgsoft transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.full_name?.split(" ")[0] || "Account"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-textmuted hover:text-danger rounded-md transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-borderline">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-primary hover:text-primary-hover px-3 py-1.5 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-3 py-1.5 rounded-md transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-textmuted hover:text-primary rounded-md"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-borderline px-4 pt-2 pb-4 space-y-2">
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-textmain hover:bg-bgsoft hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-borderline space-y-1">
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-textmain hover:bg-bgsoft"
            >
              My Orders & Tracking
            </Link>
            <Link
              to="/orders?tab=wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-textmain hover:bg-bgsoft"
            >
              My Wishlist ({wishlist.length})
            </Link>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`px-4 py-2 text-xs font-medium text-center transition-all ${
            notification.type === "error"
              ? "bg-danger text-white"
              : notification.type === "info"
                ? "bg-textmain text-white"
                : "bg-success text-white"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}
    </header>
  );
}
