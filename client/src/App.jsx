import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService, cartService } from "./services/api";
import Navbar from "./components/layout/Navbar";
import AuthModal from "./components/auth/AuthModal";
import CatalogPage from "./pages/CatalogPage";
import BookDetailsPage from "./pages/BookDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import { BookOpen, Heart, Shield, HelpCircle } from "lucide-react";

export default function App() {
  const [user, setUser] = useState(authService.getStoredUser());
  const [cart, setCart] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [globalSearch, setGlobalSearch] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  // Sync user profile from /api/v1/auth/me if token exists
  useEffect(() => {
    async function initAuth() {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          authService.logout();
          setUser(null);
        }
      }
    }
    initAuth();
  }, []);

  // Fetch cart
  const refreshCart = useCallback(async () => {
    if (authService.isAuthenticated()) {
      try {
        const cartData = await cartService.getCart();
        setCart(cartData);
      } catch {
        setCart(null);
      }
    } else {
      setCart(null);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const handleOpenAuth = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    refreshCart();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCart(null);
  };

  const handleAddToCart = async (book, quantity = 1) => {
    if (!authService.isAuthenticated()) {
      handleOpenAuth("login");
      return;
    }

    try {
      const updatedCart = await cartService.addItem(book.id, quantity);
      setCart(updatedCart);
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not add item to cart.";
      alert(typeof msg === "string" ? msg : "Error adding to cart");
    }
  };

  const handleUpdateCartQuantity = async (itemId, newQuantity) => {
    setUpdatingItemId(itemId);
    try {
      const updated = await cartService.updateItemQuantity(itemId, newQuantity);
      setCart(updated);
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not update quantity.";
      alert(typeof msg === "string" ? msg : "Error updating quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
    } catch (err) {
      const msg = err.response?.data?.detail || "Could not remove item.";
      alert(typeof msg === "string" ? msg : "Error removing item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const cleared = await cartService.clearCart();
      setCart(cleared);
    } catch {
      // Ignore
    }
  };

  const handleOrderCompleted = () => {
    refreshCart();
  };

  const cartCount = cart?.item_count || 0;

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Navbar
          user={user}
          cartCount={cartCount}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <CatalogPage
                  onAddToCart={handleAddToCart}
                  globalSearchQuery={globalSearch}
                  onClearGlobalSearch={() => setGlobalSearch("")}
                />
              }
            />
            <Route
              path="/books/:id"
              element={<BookDetailsPage onAddToCart={handleAddToCart} />}
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  user={user}
                  cart={cart}
                  onUpdateCartQuantity={handleUpdateCartQuantity}
                  onRemoveCartItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onOpenAuth={handleOpenAuth}
                  onOrderCompleted={handleOrderCompleted}
                  updatingItemId={updatingItemId}
                />
              }
            />
            <Route path="/cart" element={<Navigate to="/checkout" replace />} />
            <Route
              path="/account"
              element={<AccountPage user={user} onOpenAuth={handleOpenAuth} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        {/* Footer */}
        <footer className="bg-brand-950 text-white border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  <span className="font-serif font-bold text-xl text-white">
                    Book Haven
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                  Your premier destination for timeless literature, computer
                  science masterworks, and thought-provoking nonfiction.
                </p>
                <div className="pt-2 text-[11px] text-amber-300 flex items-center space-x-1 font-mono">
                  <span>Test Login: test@example.com / testpassword</span>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-white mb-3">
                  Quick Links
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>
                    <a href="/" className="hover:text-accent">
                      Book Catalog
                    </a>
                  </li>
                  <li>
                    <a href="/checkout" className="hover:text-accent">
                      Shopping Cart
                    </a>
                  </li>
                  <li>
                    <a href="/account" className="hover:text-accent">
                      Order History
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-white mb-3">
                  Customer Support
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-accent" />
                    <span>Secure SSL Payments</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                    <span>support@bookhaven.local</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
              <p>
                &copy; {new Date().getFullYear()} Book Haven Inc. All rights
                reserved.
              </p>
              <div className="flex items-center space-x-1 text-slate-400">
                <span>Crafted with</span>
                <Heart className="w-3.5 h-3.5 text-red-400 fill-current inline" />
                <span>for book lovers</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
