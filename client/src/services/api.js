import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post("/api/v1/auth/login", { email, password });
    if (response.data?.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

// Listings Service
export const listingsService = {
  getListings: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== "" &&
        params[key] !== null &&
        params[key] !== undefined
      ) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get("/api/v1/listings", { params: cleanParams });
    return response.data;
  },
  getListing: async (id) => {
    const response = await api.get(`/api/v1/listings/${id}`);
    return response.data;
  },
  createListing: async (listingData) => {
    const response = await api.post("/api/v1/listings", listingData);
    return response.data;
  },
  updateListing: async (id, listingData) => {
    const response = await api.put(`/api/v1/listings/${id}`, listingData);
    return response.data;
  },
  deleteListing: async (id) => {
    const response = await api.delete(`/api/v1/listings/${id}`);
    return response.data;
  },
  submitInquiry: async (id, inquiryData) => {
    const response = await api.post(
      `/api/v1/listings/${id}/inquire`,
      inquiryData,
    );
    return response.data;
  },
};

// Inquiries Service
export const inquiriesService = {
  getInquiries: async (params = {}) => {
    const response = await api.get("/api/v1/inquiries", { params });
    return response.data;
  },
};

export default api;
