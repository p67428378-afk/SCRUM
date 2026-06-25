import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getKPIs = async () => {
  const response = await api.get("/api/v1/kpis");
  return response.data;
};

export const getSKUs = async () => {
  const response = await api.get("/api/v1/skus");
  return response.data;
};

export const getScenario = async (scenarioName) => {
  const response = await api.get(`/api/v1/scenarios/${scenarioName}`);
  return response.data;
};

export const submitReview = async (selectedScenario, skuActions) => {
  const response = await api.post("/api/v1/reviews", {
    selected_scenario: selectedScenario,
    sku_actions: skuActions,
  });
  return response.data;
};

export default api;
