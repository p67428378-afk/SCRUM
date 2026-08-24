import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
};

export const itemService = {
  listItems: async (params = {}) => {
    const response = await api.get("/items", { params });
    return response.data;
  },
  getItem: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },
  getItemAdjustments: async (id) => {
    const response = await api.get(`/items/${id}/adjustments`);
    return response.data;
  },
  createItem: async (itemData) => {
    const response = await api.post("/items", itemData);
    return response.data;
  },
  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
};

export const inventoryService = {
  listLowStock: async () => {
    const response = await api.get("/inventory/low-stock");
    return response.data;
  },
  updateStock: async (itemId, stockData) => {
    const response = await api.put(`/inventory/${itemId}`, stockData);
    return response.data;
  },
  adjustStock: async (itemId, adjustmentData) => {
    const response = await api.post(
      `/inventory/${itemId}/adjust`,
      adjustmentData,
    );
    return response.data;
  },
};

export default api;
