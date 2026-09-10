import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const fetchKPIMetrics = async (params = {}) => {
  const { cluster_name = "Small Town Value Cluster", category = "Snacks" } =
    params;
  const response = await apiClient.get("/api/v1/metrics/kpi", {
    params: { cluster_name, category },
  });
  return response.data;
};

export const fetchSKUs = async (params = {}) => {
  const response = await apiClient.get("/api/v1/skus", { params });
  return response.data;
};

export const fetchScenarios = async () => {
  const response = await apiClient.get("/api/v1/scenarios");
  return response.data;
};

export const evaluateScenario = async (payload) => {
  const response = await apiClient.post("/api/v1/scenarios/evaluate", {
    scenario_type: payload.scenario_type || "Balanced",
    cluster_name: payload.cluster_name || "Small Town Value Cluster",
  });
  return response.data;
};

export const checkGuardrails = async (payload) => {
  const response = await apiClient.post("/api/v1/guardrails/check", payload);
  return response.data;
};

export const submitAssortmentPlan = async (payload) => {
  const response = await apiClient.post("/api/v1/submissions", payload);
  return response.data;
};

export const fetchSubmissions = async () => {
  const response = await apiClient.get("/api/v1/submissions");
  return response.data;
};

export const fetchSubmissionByCode = async (auditCode) => {
  const response = await apiClient.get(`/api/v1/submissions/${auditCode}`);
  return response.data;
};

export default apiClient;
