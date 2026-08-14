import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Authentication
export const registerUser = async (userData) => {
  const response = await api.post("/api/v1/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/api/v1/auth/login", credentials);
  if (response.data && response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

export const updateCurrentUser = async (userData) => {
  const response = await api.put("/api/v1/auth/me", userData);
  return response.data;
};

export const getAddresses = async () => {
  const response = await api.get("/api/v1/auth/addresses");
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await api.post("/api/v1/auth/addresses", addressData);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/api/v1/auth/addresses/${addressId}`);
  return response.data;
};

// Menu
export const getCategories = async () => {
  const response = await api.get("/api/v1/menu/categories");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/api/v1/menu/categories", categoryData);
  return response.data;
};

export const getMenuItems = async (params = {}) => {
  const response = await api.get("/api/v1/menu/items", { params });
  return response.data;
};

export const createMenuItem = async (itemData) => {
  const response = await api.post("/api/v1/menu/items", itemData);
  return response.data;
};

export const updateMenuItem = async (itemId, itemData) => {
  const response = await api.put(`/api/v1/menu/items/${itemId}`, itemData);
  return response.data;
};

// Orders
export const placeOrder = async (orderData) => {
  const response = await api.post("/api/v1/orders", orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/api/v1/orders/my-orders");
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/v1/orders/${orderId}`);
  return response.data;
};

export const getStaffDashboard = async () => {
  const response = await api.get("/api/v1/orders/staff/dashboard");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/api/v1/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};

export default api;
