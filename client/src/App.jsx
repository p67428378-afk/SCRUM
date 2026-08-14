import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import CartDrawer from "./components/cart/CartDrawer";
import DigitalMenuCartPage from "./pages/DigitalMenuCartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load persisted user & cart from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart:", e);
      }
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const handleAddToCart = (item) => {
    const existingIndex = cartItems.findIndex((i) => i.id === item.id);
    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...cartItems, { ...item, quantity: 1 }];
    }
    saveCart(updated);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updated = cartItems.map((i) =>
      i.id === itemId ? { ...i, quantity: newQty } : i,
    );
    saveCart(updated);
  };

  const handleRemoveItem = (itemId) => {
    const updated = cartItems.filter((i) => i.id !== itemId);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
    setSpecialInstructions("");
  };

  const handleReorder = (itemsToReorder) => {
    saveCart(itemsToReorder);
    setIsCartOpen(true);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans antialiased text-[#1C1917]">
        {/* Top Header Navbar */}
        <Navbar
          brand="Bandra Hotel Delivery"
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
        />

        {/* Interactive Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          specialInstructions={specialInstructions}
          onUpdateInstructions={setSpecialInstructions}
          deliveryFee={3.0}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <DigitalMenuCartPage
                  cartItems={cartItems}
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  onClearCart={handleClearCart}
                  specialInstructions={specialInstructions}
                />
              }
            />
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  currentUser={currentUser}
                  onUserChange={setCurrentUser}
                  onReorder={handleReorder}
                />
              }
            />
            <Route
              path="/login"
              element={<LoginPage onUserChange={setCurrentUser} />}
            />
            <Route
              path="/register"
              element={<RegisterPage onUserChange={setCurrentUser} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
          <p>© 2026 Bandra Hotel Gourmet Food Delivery. All rights reserved.</p>
          <p className="mt-1">
            Serving authentic Bandra culinary delights fresh to your doorstep.
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
