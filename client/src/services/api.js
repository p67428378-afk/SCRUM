import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("dg_auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Health
  checkHealth: async () => {
    const response = await apiClient.get("/api/v1/health");
    return response.data;
  },

  // Auth
  login: async (email, password) => {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    if (response.data?.access_token) {
      localStorage.setItem("dg_auth_token", response.data.access_token);
      localStorage.setItem("dg_user", JSON.stringify(response.data.user || {}));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("dg_auth_token");
    localStorage.removeItem("dg_user");
  },

  getMe: async () => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },

  // KPIs
  getKPIs: async (clusterName = "Small Town Value Cluster") => {
    const response = await apiClient.get("/api/v1/kpis", {
      params: { cluster_name: clusterName },
    });
    return response.data;
  },

  // SKUs
  getSKUs: async (params = {}) => {
    const cleanParams = {};
    if (params.sub_category) cleanParams.sub_category = params.sub_category;
    if (params.action_badge) cleanParams.action_badge = params.action_badge;
    if (params.brand_type) cleanParams.brand_type = params.brand_type;
    if (params.search) cleanParams.search = params.search;
    if (params.skip !== undefined) cleanParams.skip = params.skip;
    if (params.limit !== undefined) cleanParams.limit = params.limit;

    const response = await apiClient.get("/api/v1/skus", {
      params: cleanParams,
    });
    return response.data;
  },

  getSKU: async (skuId) => {
    const response = await apiClient.get(`/api/v1/skus/${skuId}`);
    return response.data;
  },

  createSKU: async (skuData) => {
    const response = await apiClient.post("/api/v1/skus", skuData);
    return response.data;
  },

  updateSKU: async (skuId, skuData) => {
    const response = await apiClient.put(`/api/v1/skus/${skuId}`, skuData);
    return response.data;
  },

  // Scenarios
  getScenarios: async () => {
    const response = await apiClient.get("/api/v1/scenarios");
    return response.data;
  },

  evaluateScenario: async (scenario = "Balanced", customParameters = {}) => {
    const response = await apiClient.post("/api/v1/scenarios/evaluate", {
      scenario,
      custom_parameters: customParameters,
    });
    return response.data;
  },

  // Guardrails
  checkGuardrails: async (
    scenario = "Balanced",
    clusterName = "Small Town Value Cluster",
  ) => {
    const response = await apiClient.post("/api/v1/guardrails/check", {
      scenario,
      cluster_name: clusterName,
    });
    return response.data;
  },

  // Approvals & Audit
  submitApproval: async ({
    scenario = "Balanced",
    cluster_name = "Small Town Value Cluster",
    user_id = "user@dollargeneral.com",
    notes = null,
  }) => {
    const response = await apiClient.post("/api/v1/approvals/submit", {
      scenario,
      cluster_name,
      user_id,
      notes,
    });
    return response.data;
  },

  getAuditTrail: async (limit = 20) => {
    const response = await apiClient.get("/api/v1/approvals/audit-trail", {
      params: { limit },
    });
    return response.data;
  },
};

export default api;
