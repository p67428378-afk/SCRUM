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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if stored
      if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);

export const loginApi = async (email, password) => {
  const response = await api.post("/api/v1/auth/login", { email, password });
  return response.data;
};

export const signupApi = async (email, password, full_name = "") => {
  const response = await api.post("/api/v1/auth/signup", {
    email,
    password,
    full_name,
  });
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

export const getTasksApi = async (params = {}) => {
  const response = await api.get("/api/v1/tasks", { params });
  return response.data;
};

export const createTaskApi = async (taskData) => {
  const response = await api.post("/api/v1/tasks", taskData);
  return response.data;
};

export const getTaskByIdApi = async (taskId) => {
  const response = await api.get(`/api/v1/tasks/${taskId}`);
  return response.data;
};

export const updateTaskApi = async (taskId, taskData) => {
  const response = await api.put(`/api/v1/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTaskApi = async (taskId) => {
  const response = await api.delete(`/api/v1/tasks/${taskId}`);
  return response.data;
};

export const getDashboardStatsApi = async () => {
  const response = await api.get("/api/v1/dashboard/stats");
  return response.data;
};

export default api;
