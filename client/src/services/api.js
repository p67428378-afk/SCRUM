import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to manage guest session ID
function getSessionId() {
  let sessionId = localStorage.getItem("cart_session_id");
  if (!sessionId) {
    sessionId =
      "session_" +
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);
    localStorage.setItem("cart_session_id", sessionId);
  }
  return sessionId;
}

// Request interceptor for auth token and session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["X-Session-ID"] = getSessionId();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// User API
export const registerUser = async (userData) => {
  const response = await api.post("/api/v1/users/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/api/v1/users/login", credentials);
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/api/v1/users/profile");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

// Products API
export const getProducts = async (params = {}) => {
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      cleanParams[key] = params[key];
    }
  });
  const response = await api.get("/api/v1/products", { params: cleanParams });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/api/v1/products/${id}`);
  return response.data;
};

// Cart API
export const getCart = async () => {
  const response = await api.get("/api/v1/cart");
  return response.data;
};

export const addToCart = async (variantId, quantity = 1) => {
  const response = await api.post("/api/v1/cart/items", {
    variant_id: variantId,
    quantity: quantity,
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/api/v1/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  await api.delete(`/api/v1/cart/items/${itemId}`);
  return true;
};

// Wishlist API
export const getWishlist = async () => {
  const response = await api.get("/api/v1/wishlist");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post("/api/v1/wishlist", {
    product_id: productId,
  });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/api/v1/wishlist/${productId}`);
  return response.data;
};

export const moveToCartFromWishlist = async (productId) => {
  const response = await api.post(`/api/v1/wishlist/${productId}/move-to-cart`);
  return response.data;
};

// Orders API
export const checkout = async (checkoutData) => {
  const response = await api.post("/api/v1/orders/checkout", checkoutData);
  return response.data;
};

export const getUserOrders = async (params = {}) => {
  const response = await api.get("/api/v1/orders", { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/api/v1/orders/${id}`);
  return response.data;
};

export default api;
