import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    if (response.data?.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/api/v1/auth/register", userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("access_token");
  },
};

export const pickupsApi = {
  createPickup: async (pickupData) => {
    const response = await api.post("/api/v1/pickups", pickupData);
    return response.data;
  },
  getPickups: async (params = {}) => {
    const response = await api.get("/api/v1/pickups", { params });
    return response.data;
  },
  getPickupById: async (pickupId) => {
    const response = await api.get(`/api/v1/pickups/${pickupId}`);
    return response.data;
  },
};

export const binsApi = {
  getBins: async (params = {}) => {
    const response = await api.get("/api/v1/bins", { params });
    return response.data;
  },
  createBin: async (binData) => {
    const response = await api.post("/api/v1/bins", binData);
    return response.data;
  },
  getBinById: async (binId) => {
    const response = await api.get(`/api/v1/bins/${binId}`);
    return response.data;
  },
  updateBin: async (binId, binData) => {
    const response = await api.patch(`/api/v1/bins/${binId}`, binData);
    return response.data;
  },
  updateTelemetry: async (binId, telemetryData) => {
    const response = await api.post(
      `/api/v1/bins/${binId}/telemetry`,
      telemetryData,
    );
    return response.data;
  },
};

export const routesApi = {
  getRoutes: async (params = {}) => {
    const response = await api.get("/api/v1/routes", { params });
    return response.data;
  },
  createRoute: async (routeData) => {
    const response = await api.post("/api/v1/routes", routeData);
    return response.data;
  },
  getRouteById: async (routeId) => {
    const response = await api.get(`/api/v1/routes/${routeId}`);
    return response.data;
  },
  updateTaskStatus: async (taskId, taskData) => {
    const response = await api.patch(
      `/api/v1/routes/tasks/${taskId}`,
      taskData,
    );
    return response.data;
  },
};

export const analyticsApi = {
  getSummary: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/summary", { params });
    return response.data;
  },
  getHeatmaps: async () => {
    const response = await api.get("/api/v1/analytics/heatmaps");
    return response.data;
  },
};

export default api;
