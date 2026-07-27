import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to inject JWT token
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
  register: async (data) => {
    const response = await api.post("/api/v1/auth/register", data);
    return response.data;
  },
  login: async (data) => {
    const response = await api.post("/api/v1/auth/login", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/api/v1/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  },
  sendMfaCode: async (userId) => {
    const response = await api.post("/api/v1/auth/mfa/send-code", {
      user_id: userId,
    });
    return response.data;
  },
  verifyMfaCode: async (userId, code) => {
    const response = await api.post("/api/v1/auth/mfa/verify-code", {
      user_id: userId,
      code,
    });
    return response.data;
  },
};

export const accountService = {
  getAccounts: async () => {
    const response = await api.get("/api/v1/accounts");
    return response.data;
  },
  getTransactions: async (accountId, params = {}) => {
    const response = await api.get(
      `/api/v1/accounts/${accountId}/transactions`,
      { params },
    );
    return response.data;
  },
  openAccount: async (data) => {
    const response = await api.post("/api/v1/accounts", data);
    return response.data;
  },
  getStatements: async (accountId) => {
    const response = await api.get(`/api/v1/accounts/${accountId}/statements`);
    return response.data;
  },
  getStatementDetail: async (accountId, statementId) => {
    const response = await api.get(
      `/api/v1/accounts/${accountId}/statements/${statementId}`,
    );
    return response.data;
  },
  exportTransactions: async (accountId) => {
    const response = await api.get(
      `/api/v1/accounts/${accountId}/transactions/export`,
      { responseType: "blob" },
    );
    return response.data;
  },
};

export const profileService = {
  getProfile: async () => {
    const response = await api.get("/api/v1/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/api/v1/profile", data);
    return response.data;
  },
};

export const transferService = {
  createTransfer: async (data) => {
    const response = await api.post("/api/v1/transfers", data);
    return response.data;
  },
  getTransferStatus: async (transferId) => {
    const response = await api.get(`/api/v1/transfers/${transferId}`);
    return response.data;
  },
};

export const adminService = {
  getUser: async (userId) => {
    const response = await api.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  },
  getLogs: async (params = {}) => {
    const response = await api.get("/api/v1/admin/logs", { params });
    return response.data;
  },
  openAccount: async (data) => {
    const response = await api.post("/api/v1/admin/accounts", data);
    return response.data;
  },
  updateAccount: async (accountId, data) => {
    const response = await api.put(`/api/v1/admin/accounts/${accountId}`, data);
    return response.data;
  },
  lockUser: async (userId, isActive) => {
    const response = await api.put(`/api/v1/admin/users/${userId}/lock`, {
      is_active: isActive,
    });
    return response.data;
  },
  forcePasswordReset: async (userId, newPassword) => {
    const response = await api.post(
      `/api/v1/admin/users/${userId}/force-password-reset`,
      { new_password: newPassword },
    );
    return response.data;
  },
};

export default api;
