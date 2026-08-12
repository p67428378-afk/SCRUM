import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/api/v1/auth/login", { email, password });
    if (response.data?.access_token) {
      localStorage.setItem("auth_token", response.data.access_token);
    }
    return response.data;
  },
  register: async (email, password) => {
    const response = await api.post("/api/v1/auth/register", {
      email,
      password,
    });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("auth_token");
  },
};

export const tasksAPI = {
  createTask: async (actionType, parameters = {}) => {
    const response = await api.post("/api/v1/tasks", {
      action_type: actionType,
      parameters: parameters,
    });
    return response.data;
  },
  getTaskStatus: async (taskId) => {
    const response = await api.get(`/api/v1/tasks/${taskId}/status`);
    return response.data;
  },
  listTasks: async (skip = 0, limit = 50) => {
    const response = await api.get("/api/v1/tasks", {
      params: { skip, limit },
    });
    return response.data;
  },
};

export const getWebSocketUrl = (taskId) => {
  const token = localStorage.getItem("auth_token") || "";
  const cleanBase = BASE_URL.replace(/^http/, "ws");
  return `${cleanBase}/api/v1/ws/tasks/${taskId}?token=${encodeURIComponent(token)}`;
};

export default api;
