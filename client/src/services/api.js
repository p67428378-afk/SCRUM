import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Optional: redirect to login or trigger state change
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (email, password, mfaCode = null) => {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
      mfa_code: mfaCode,
    });
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
  },
  logout: async () => {
    try {
      await api.post("/api/v1/auth/logout");
    } finally {
      localStorage.removeItem("token");
    }
    return { message: "Successfully logged out" };
  },
};

export const profileService = {
  getProfile: async () => {
    const response = await api.get("/api/v1/profile");
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put("/api/v1/profile", profileData);
    return response.data;
  },
};

export const academicsService = {
  getAcademicProgress: async () => {
    const response = await api.get("/api/v1/academics/progress");
    return response.data;
  },
};

export default api;
