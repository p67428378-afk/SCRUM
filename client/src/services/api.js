import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async register(email, password, fullName) {
    const response = await apiClient.post("/api/v1/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    if (response.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  async login(email, password) {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    if (response.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};

export const catalogService = {
  async getCategories() {
    const response = await apiClient.get("/api/v1/categories");
    return response.data;
  },

  async getBooks(params = {}) {
    const response = await apiClient.get("/api/v1/books", { params });
    return response.data;
  },

  async getBookById(id) {
    const response = await apiClient.get(`/api/v1/books/${id}`);
    return response.data;
  },
};

export const cartService = {
  async getCart() {
    const response = await apiClient.get("/api/v1/cart");
    return response.data;
  },

  async addItem(bookId, quantity = 1) {
    const response = await apiClient.post("/api/v1/cart/items", {
      book_id: bookId,
      quantity,
    });
    return response.data;
  },

  async updateItemQuantity(itemId, quantity) {
    const response = await apiClient.put(`/api/v1/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(itemId) {
    const response = await apiClient.delete(`/api/v1/cart/items/${itemId}`);
    return response.data;
  },

  async clearCart() {
    const response = await apiClient.delete("/api/v1/cart");
    return response.data;
  },
};

export const orderService = {
  async checkout(shippingAddress, paymentMethod) {
    const response = await apiClient.post("/api/v1/orders/checkout", {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  async getOrders() {
    const response = await apiClient.get("/api/v1/orders");
    return response.data;
  },

  async getOrderById(id) {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    return response.data;
  },
};

export default {
  auth: authService,
  catalog: catalogService,
  cart: cartService,
  order: orderService,
};
