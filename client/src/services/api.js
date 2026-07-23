import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getKPIs = async () => {
  const response = await api.get("/api/v1/assortment/kpis");
  return response.data;
};

export const getSKUs = async (params = {}) => {
  const response = await api.get("/api/v1/assortment/skus", { params });
  return response.data;
};

export const getScenarios = async () => {
  const response = await api.get("/api/v1/assortment/scenarios");
  return response.data;
};

export const submitAssortment = async (payload) => {
  const response = await api.post("/api/v1/assortment/submit", payload);
  return response.data;
};

export default api;
