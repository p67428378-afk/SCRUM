import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from "../services/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shipping_estimate: 0,
    tax_estimate: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addItem = async (variantId, quantity = 1) => {
    try {
      const updated = await apiAddToCart(variantId, quantity);
      setCart(updated);
      return updated;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to add item to cart";
      throw new Error(msg);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const updated = await apiUpdateCartItem(itemId, quantity);
      setCart(updated);
      return updated;
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Failed to update item quantity";
      throw new Error(msg);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiRemoveCartItem(itemId);
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
