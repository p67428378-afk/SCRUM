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

export const submitAssortmentPlan = async (scenarioName, skuActions) => {
  const response = await api.post("/api/v1/assortment/submit", {
    scenario_name: scenarioName,
    sku_actions: skuActions,
  });
  return response.data;
};

export default api;
