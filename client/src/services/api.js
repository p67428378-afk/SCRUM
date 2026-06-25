import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getDashboardData = async () => {
  const response = await api.get("/api/v1/assortment/dashboard");
  return response.data;
};

export const submitAssortment = async (payload) => {
  const response = await api.post("/api/v1/assortment/submit", payload);
  return response.data;
};

export default api;
