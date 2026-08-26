import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartApi, wishlistApi } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    id: "",
    items: [],
    subtotal: 0,
    coupon_code: null,
    discount_percent: 0,
    discount_amount: 0,
    tax_amount: 0,
    shipping_amount: 0,
    total_amount: 0,
  });
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await cartApi.getCart();
      setCart(res.data);
    } catch {
      // Keep existing or empty cart state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!localStorage.getItem("furnicraft_token")) {
      setWishlist([]);
      return;
    }
    try {
      const res = await wishlistApi.getWishlist();
      setWishlist(res.data || []);
    } catch {
      setWishlist([]);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist, user]);

  const addToCart = async (itemData) => {
    try {
      const res = await cartApi.addToCart(itemData);
      setCart(res.data);
      showNotification("Item added to cart!", "success");
      return { success: true, cart: res.data };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to add item to cart";
      showNotification(msg, "error");
      return { success: false, error: msg };
    }
  };

  const updateQuantity = async (itemId, quantity, finish, dimension) => {
    try {
      const payload = { quantity };
      if (finish) payload.selected_finish = finish;
      if (dimension) payload.selected_dimension = dimension;
      const res = await cartApi.updateCartItem(itemId, payload);
      setCart(res.data);
      return { success: true, cart: res.data };
    } catch (err) {
      const msg =
        err?.response?.data?.detail || "Failed to update item quantity";
      showNotification(msg, "error");
      return { success: false, error: msg };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeCartItem(itemId);
      setCart(res.data);
      showNotification("Item removed from cart", "info");
      return { success: true, cart: res.data };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to remove item";
      showNotification(msg, "error");
      return { success: false, error: msg };
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      setCart(res.data);
      return { success: true, cart: res.data };
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to clear cart";
      showNotification(msg, "error");
      return { success: false, error: msg };
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await cartApi.applyCoupon(code);
      await fetchCart();
      showNotification(res.data.message || "Coupon applied!", "success");
      return { success: true, data: res.data };
    } catch (err) {
      const msg =
        err?.response?.data?.detail || "Invalid promotional coupon code";
      showNotification(msg, "error");
      return { success: false, error: msg };
    }
  };

  const toggleWishlist = async (productId) => {
    if (!localStorage.getItem("furnicraft_token")) {
      showNotification("Please log in to manage your wishlist", "error");
      return false;
    }
    const isSaved = wishlist.some((item) => item.product_id === productId);
    try {
      if (isSaved) {
        await wishlistApi.removeFromWishlist(productId);
        setWishlist((prev) =>
          prev.filter((item) => item.product_id !== productId),
        );
        showNotification("Removed from wishlist", "info");
      } else {
        const res = await wishlistApi.addToWishlist(productId);
        setWishlist((prev) => [...prev, res.data]);
        showNotification("Added to wishlist!", "success");
      }
      return true;
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to update wishlist";
      showNotification(msg, "error");
      return false;
    }
  };

  const itemCount = (cart.items || []).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isLoading,
        notification,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        wishlist,
        fetchWishlist,
        toggleWishlist,
        showNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
