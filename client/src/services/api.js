import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto logout redirect if not on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await apiClient.get("/api/v1/auth/users", { params });
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/v1/projects", { params });
    return response.data;
  },
  get: async (id) => {
    const response = await apiClient.get(`/api/v1/projects/${id}`);
    return response.data;
  },
  create: async (projectData) => {
    const response = await apiClient.post("/api/v1/projects", projectData);
    return response.data;
  },
  update: async (id, projectData) => {
    const response = await apiClient.put(`/api/v1/projects/${id}`, projectData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/api/v1/projects/${id}`);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/v1/tasks", { params });
    return response.data;
  },
  get: async (id) => {
    const response = await apiClient.get(`/api/v1/tasks/${id}`);
    return response.data;
  },
  create: async (taskData) => {
    const response = await apiClient.post("/api/v1/tasks", taskData);
    return response.data;
  },
  update: async (id, taskData) => {
    const response = await apiClient.put(`/api/v1/tasks/${id}`, taskData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/api/v1/tasks/${id}`);
    return response.data;
  },
};

// Comments API
export const commentsApi = {
  listForTask: async (taskId) => {
    const response = await apiClient.get(`/api/v1/tasks/${taskId}/comments`);
    return response.data;
  },
  createForTask: async (taskId, commentData) => {
    const response = await apiClient.post(
      `/api/v1/tasks/${taskId}/comments`,
      commentData,
    );
    return response.data;
  },
  update: async (id, commentData) => {
    const response = await apiClient.put(`/api/v1/comments/${id}`, commentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/api/v1/comments/${id}`);
    return response.data;
  },
};

export default {
  auth: authApi,
  projects: projectsApi,
  tasks: tasksApi,
  comments: commentsApi,
};
