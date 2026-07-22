import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const ADMIN_TOKEN = "admin-secret-token";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to inject the admin token
api.interceptors.request.use(
  (config) => {
    config.headers["x-admin-token"] = ADMIN_TOKEN;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const getExportStatus = async () => {
  const response = await api.get("/api/v1/exports/status");
  return response.data;
};

export const triggerExport = async () => {
  const response = await api.post("/api/v1/exports/trigger");
  return response.data;
};

export const getExportConfig = async () => {
  const response = await api.get("/api/v1/exports/config");
  return response.data;
};

export const updateExportConfig = async (configData) => {
  const response = await api.put("/api/v1/exports/config", configData);
  return response.data;
};

export default api;
