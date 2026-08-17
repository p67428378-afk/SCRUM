import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding JWT token
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

export const authApi = {
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    if (response.data && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const attendanceApi = {
  checkIn: async () => {
    const response = await api.post("/api/v1/attendance/check-in");
    return response.data;
  },
  checkOut: async () => {
    const response = await api.post("/api/v1/attendance/check-out");
    return response.data;
  },
  getHistory: async (params = {}) => {
    const response = await api.get("/api/v1/attendance/history", { params });
    return response.data;
  },
  getTeamHistory: async (params = {}) => {
    const response = await api.get("/api/v1/attendance/team", { params });
    return response.data;
  },
};

export const approvalsApi = {
  submitRequest: async (data) => {
    const response = await api.post("/api/v1/approvals/request", data);
    return response.data;
  },
  getRequests: async (params = {}) => {
    const response = await api.get("/api/v1/approvals/requests", { params });
    return response.data;
  },
  updateRequest: async (requestId, status) => {
    const response = await api.put(`/api/v1/approvals/requests/${requestId}`, {
      status,
    });
    return response.data;
  },
};

export const adminApi = {
  adjustAttendance: async (
    attendanceId,
    { requested_check_in, requested_check_out, reason },
  ) => {
    const response = await api.put(
      `/api/v1/admin/attendance/${attendanceId}`,
      null,
      {
        params: { requested_check_in, requested_check_out, reason },
      },
    );
    return response.data;
  },
  getAuditLogs: async (params = {}) => {
    const response = await api.get("/api/v1/admin/audit-logs", { params });
    return response.data;
  },
};

export default api;
