import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const authService = {
  register: async (userData) => {
    const response = await api.post("/api/v1/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    if (response.data && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
};

export const catService = {
  list: async (params = {}) => {
    const response = await api.get("/api/v1/cats", { params });
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/api/v1/cats/${id}`);
    return response.data;
  },
  create: async (catData) => {
    const response = await api.post("/api/v1/cats", catData);
    return response.data;
  },
  update: async (id, catData) => {
    const response = await api.put(`/api/v1/cats/${id}`, catData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/cats/${id}`);
    return response.data;
  },
};

export const inquiryService = {
  create: async (catId, inquiryData) => {
    const response = await api.post(
      `/api/v1/cats/${catId}/inquiries`,
      inquiryData,
    );
    return response.data;
  },
  list: async () => {
    const response = await api.get("/api/v1/inquiries");
    return response.data;
  },
};

export default api;
