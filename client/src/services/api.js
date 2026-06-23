import axios from "axios";

const PORTS = ["8080", "8000"];
let currentPortIndex = 0;

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;
    // If we are running on port 3000 or 5173 (Vite dev server), try localhost backend ports
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      port === "3000" ||
      port === "5173"
    ) {
      return `http://localhost:${PORTS[currentPortIndex]}`;
    }
    // If we are on a remote server/Cloud Run and VITE_API_BASE_URL is not set,
    // use relative path so it routes to the same host.
    return "";
  }
  return `http://localhost:${PORTS[currentPortIndex]}`;
};

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-User-ID": "manager123",
  },
});

// Set baseURL dynamically before each request
api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  return config;
});

// Interceptor to handle connection failures and switch ports
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If it's a network error (no response) and we haven't retried this request yet
    if (
      !error.response &&
      !originalRequest._retry &&
      !import.meta.env.VITE_API_BASE_URL
    ) {
      originalRequest._retry = true;
      // Switch to the other port
      currentPortIndex = (currentPortIndex + 1) % PORTS.length;
      console.warn(
        `Connection failed. Switching backend port to ${PORTS[currentPortIndex]} and retrying...`,
      );
      originalRequest.baseURL = getBaseURL();
      return api(originalRequest);
    }
    return Promise.reject(error);
  },
);

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
