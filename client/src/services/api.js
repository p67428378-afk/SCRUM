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
  (error) => Promise.reject(error),
);

export const authService = {
  register: async (userData) => {
    const response = await api.post("/api/v1/auth/register", userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export const paymentsService = {
  getAccounts: async () => {
    const response = await api.get("/api/v1/payments/accounts");
    return response.data;
  },
  linkAccount: async (accountData) => {
    const response = await api.post("/api/v1/payments/accounts", accountData);
    return response.data;
  },
  unlinkAccount: async (accountId) => {
    const response = await api.delete(`/api/v1/payments/accounts/${accountId}`);
    return response.data;
  },
  getPayees: async () => {
    const response = await api.get("/api/v1/payments/payees");
    return response.data;
  },
  getSchedules: async () => {
    const response = await api.get("/api/v1/payments/recurring");
    return response.data;
  },
  createSchedule: async (scheduleData) => {
    const response = await api.post("/api/v1/payments/recurring", scheduleData);
    return response.data;
  },
  getSchedule: async (scheduleId) => {
    const response = await api.get(`/api/v1/payments/recurring/${scheduleId}`);
    return response.data;
  },
  updateSchedule: async (scheduleId, scheduleData) => {
    const response = await api.put(
      `/api/v1/payments/recurring/${scheduleId}`,
      scheduleData,
    );
    return response.data;
  },
  cancelSchedule: async (scheduleId) => {
    const response = await api.delete(
      `/api/v1/payments/recurring/${scheduleId}`,
    );
    return response.data;
  },
  executeSchedule: async (scheduleId) => {
    const response = await api.post(
      `/api/v1/payments/recurring/${scheduleId}/execute`,
    );
    return response.data;
  },
};

export default api;
