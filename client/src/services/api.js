import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh or unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, token_type } = response.data;
          localStorage.setItem("access_token", access_token);
          api.defaults.headers.common["Authorization"] =
            `Bearer ${access_token}`;
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid, clear storage and redirect
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-change"));
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  register: async (payload) => {
    const response = await api.post("/api/v1/auth/register", payload);
    return response.data;
  },

  login: async (payload) => {
    const response = await api.post("/api/v1/auth/login", payload);
    return response.data;
  },

  verifyMfa: async (payload) => {
    const response = await api.post("/api/v1/auth/verify-mfa", payload);
    const { access_token, refresh_token, user } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));
    window.dispatchEvent(new Event("auth-change"));
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
    }
  },

  recoverInitiate: async (payload) => {
    const response = await api.post("/api/v1/auth/recover/initiate", payload);
    return response.data;
  },

  recoverComplete: async (payload) => {
    const response = await api.post("/api/v1/auth/recover/complete", payload);
    return response.data;
  },

  getSession: async () => {
    const response = await api.get("/api/v1/auth/session");
    return response.data;
  },
};

export default api;
