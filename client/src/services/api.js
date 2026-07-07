import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

export const getKPIs = async () => {
  const response = await api.get("/api/v1/kpis");
  return response.data;
};

export const getSKUs = async () => {
  const response = await api.get("/api/v1/skus");
  return response.data;
};

export const selectScenario = async (scenarioName) => {
  const response = await api.post("/api/v1/scenarios", {
    scenario: scenarioName,
  });
  return response.data;
};

export const submitReview = async (scenarioName) => {
  const response = await api.post("/api/v1/reviews", {
    scenario: scenarioName,
  });
  return response.data;
};

export default api;
