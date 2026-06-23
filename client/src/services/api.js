import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-User-ID": "manager123",
  },
});

export const getDashboardStats = async () => {
  const response = await api.get("/api/v1/dashboard/stats");
  return response.data;
};

export const getInventory = async (params = {}) => {
  const response = await api.get("/api/v1/inventory", { params });
  return response.data;
};

export const createInventoryItem = async (data) => {
  const response = await api.post("/api/v1/inventory", data);
  return response.data;
};

export const getInventoryItem = async (id) => {
  const response = await api.get(`/api/v1/inventory/${id}`);
  return response.data;
};

export const updateInventoryItem = async (id, data) => {
  const response = await api.put(`/api/v1/inventory/${id}`, data);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/api/v1/inventory/${id}`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get("/api/v1/audit-log");
  return response.data;
};

export const getAttributes = async () => {
  const response = await api.get("/api/v1/attributes");
  return response.data;
};

export default api;
