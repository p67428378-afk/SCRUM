import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getItems = async (params = {}) => {
  const response = await api.get("/api/v1/items", { params });
  return response.data;
};

export const createItem = async (itemData) => {
  const response = await api.post("/api/v1/items", itemData);
  return response.data;
};

export const getInventory = async (params = {}) => {
  const response = await api.get("/api/v1/inventory", { params });
  return response.data;
};

export const createStockAdjustment = async (adjustmentData) => {
  const response = await api.post("/api/v1/stock-adjustments", adjustmentData);
  return response.data;
};

export const getStockAdjustments = async (params = {}) => {
  const response = await api.get("/api/v1/stock-adjustments", { params });
  return response.data;
};

export const getAlerts = async (params = {}) => {
  const response = await api.get("/api/v1/alerts", { params });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/api/v1/categories");
  return response.data;
};

export const getWarehouses = async () => {
  const response = await api.get("/api/v1/warehouses");
  return response.data;
};

export default api;
