import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function getSessionId() {
  let sessionId = localStorage.getItem("furnicraft_session_id");
  if (!sessionId) {
    sessionId =
      "sess_" +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);
    localStorage.setItem("furnicraft_session_id", sessionId);
  }
  return sessionId;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("furnicraft_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["X-Session-ID"] = getSessionId();
  return config;
});

// Auth API
export const authApi = {
  register: (data) => apiClient.post("/api/v1/auth/register", data),
  login: (data) => apiClient.post("/api/v1/auth/login", data),
  getMe: () => apiClient.get("/api/v1/auth/me"),
  getAddresses: () => apiClient.get("/api/v1/auth/addresses"),
  createAddress: (data) => apiClient.post("/api/v1/auth/addresses", data),
  updateAddress: (id, data) =>
    apiClient.put(`/api/v1/auth/addresses/${id}`, data),
  deleteAddress: (id) => apiClient.delete(`/api/v1/auth/addresses/${id}`),
};

// Products & Categories API
export const productApi = {
  getProducts: (params = {}) => apiClient.get("/api/v1/products", { params }),
  getProduct: (id) => apiClient.get(`/api/v1/products/${id}`),
  getCategories: () => apiClient.get("/api/v1/categories"),
};

// Cart API
export const cartApi = {
  getCart: () => apiClient.get("/api/v1/cart"),
  addToCart: (data) => apiClient.post("/api/v1/cart/items", data),
  updateCartItem: (itemId, data) =>
    apiClient.put(`/api/v1/cart/items/${itemId}`, data),
  removeCartItem: (itemId) => apiClient.delete(`/api/v1/cart/items/${itemId}`),
  clearCart: () => apiClient.delete("/api/v1/cart/clear"),
  applyCoupon: (couponCode) =>
    apiClient.post("/api/v1/cart/coupon", { coupon_code: couponCode }),
};

// Checkout & Orders API
export const orderApi = {
  estimateCheckout: (data) => apiClient.post("/api/v1/checkout/estimate", data),
  createOrder: (data) => apiClient.post("/api/v1/orders", data),
  getOrders: () => apiClient.get("/api/v1/orders"),
  getOrder: (id) => apiClient.get(`/api/v1/orders/${id}`),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => apiClient.get("/api/v1/wishlist"),
  addToWishlist: (productId) => apiClient.post(`/api/v1/wishlist/${productId}`),
  removeFromWishlist: (productId) =>
    apiClient.delete(`/api/v1/wishlist/${productId}`),
};

export default apiClient;
