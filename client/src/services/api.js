import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getKpis = async () => {
  const response = await apiClient.get("/api/v1/kpis");
  return response.data;
};

export const getSkus = async (sortBy = null, status = null) => {
  const params = {};
  if (sortBy) params.sort_by = sortBy;
  if (status) params.status = status;
  const response = await apiClient.get("/api/v1/skus", { params });
  return response.data;
};

export const getScenario = async (scenarioName) => {
  const response = await apiClient.get(`/api/v1/scenarios/${scenarioName}`);
  return response.data;
};

export const submitApproval = async (scenarioName, decisionPayload) => {
  const response = await apiClient.post("/api/v1/approvals", {
    scenario_name: scenarioName,
    decision_payload: decisionPayload,
  });
  return response.data;
};
