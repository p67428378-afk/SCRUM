import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tea catalog endpoints
export const getTeas = async () => {
  const response = await api.get("/api/v1/teas");
  return response.data;
};

export const createTea = async (teaData) => {
  const response = await api.post("/api/v1/teas", teaData);
  return response.data;
};

export const getTeaById = async (id) => {
  const response = await api.get(`/api/v1/teas/${id}`);
  return response.data;
};

// Inventory endpoints
export const adjustInventory = async (adjustmentData) => {
  const response = await api.post("/api/v1/inventory/adjust", adjustmentData);
  return response.data;
};

export const getInventoryAlerts = async () => {
  const response = await api.get("/api/v1/inventory/alerts");
  return response.data;
};

// Order endpoints
export const getOrders = async (params = {}) => {
  const response = await api.get("/api/v1/orders", { params });
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/api/v1/orders", orderData);
  return response.data;
};

// Recipe endpoints
export const getRecipes = async () => {
  const response = await api.get("/api/v1/recipes");
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post("/api/v1/recipes", recipeData);
  return response.data;
};

// Quality Log endpoints
export const logQuality = async (qualityData) => {
  const response = await api.post("/api/v1/quality-logs", qualityData);
  return response.data;
};

export const getQualityLogs = async () => {
  const response = await api.get("/api/v1/quality-logs");
  return response.data;
};

export default {
  getTeas,
  createTea,
  getTeaById,
  adjustInventory,
  getInventoryAlerts,
  getOrders,
  createOrder,
  getRecipes,
  createRecipe,
  logQuality,
  getQualityLogs,
};
