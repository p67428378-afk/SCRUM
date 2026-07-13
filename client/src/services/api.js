import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
});

export const getKPIs = async () => {
  const response = await api.get("/api/v1/kpis");
  return response.data;
};

export const getSKUs = async (page = 1, limit = 50) => {
  const response = await api.get("/api/v1/skus", {
    params: { page, limit },
  });
  return response.data;
};

export const getScenario = async (scenarioName) => {
  const response = await api.get(`/api/v1/scenarios/${scenarioName}`);
  return response.data;
};

export const submitApproval = async (scenarioName) => {
  const response = await api.post("/api/v1/approvals", {
    scenario_name: scenarioName,
  });
  return response.data;
};

export const getApprovalDetails = async (approvalId) => {
  const response = await api.get(`/api/v1/approvals/${approvalId}`);
  return response.data;
};

export default api;
