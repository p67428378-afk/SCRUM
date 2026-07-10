import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getKPIs = async () => {
  const response = await apiClient.get("/api/v1/kpis");
  return response.data;
};

export const getSKUs = async (params = {}) => {
  const response = await apiClient.get("/api/v1/skus", { params });
  return response.data;
};

export const getScenario = async (scenarioName) => {
  const response = await apiClient.get(`/api/v1/scenarios/${scenarioName}`);
  return response.data;
};

export const submitAssortment = async (scenarioName) => {
  const response = await apiClient.post("/api/v1/assortments", {
    scenario_name: scenarioName,
  });
  return response.data;
};

export const getAssortment = async (transactionId) => {
  const response = await apiClient.get(`/api/v1/assortments/${transactionId}`);
  return response.data;
};
