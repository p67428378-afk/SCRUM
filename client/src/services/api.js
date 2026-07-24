import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // Also support the explicit header parameter if required by backend
      config.headers["authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle token refresh
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
          const { access_token, refresh_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
          originalRequest.headers["authorization"] = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, clear storage and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-expired"));
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: async (
    username,
    password,
    channel = "web",
    deviceFingerprint = "browser-fingerprint",
  ) => {
    const response = await api.post("/api/v1/auth/login", {
      username,
      password,
      channel,
      device_fingerprint: deviceFingerprint,
    });
    return response.data;
  },

  verifyMfa: async (mfaSessionId, method, code) => {
    const response = await api.post("/api/v1/auth/mfa/verify", {
      mfa_session_id: mfaSessionId,
      method,
      code,
    });
    const data = response.data;
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  resendMfa: async (mfaSessionId, method) => {
    const response = await api.post("/api/v1/auth/mfa/resend", {
      mfa_session_id: mfaSessionId,
      method,
    });
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      if (refreshToken) {
        await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
      }
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  stepUp: async (actionType, amount = null, code = null) => {
    const response = await api.post("/api/v1/auth/step-up", {
      action_type: actionType,
      amount,
      code,
    });
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const sessionService = {
  listSessions: async () => {
    const response = await api.get("/api/v1/sessions");
    return response.data;
  },

  revokeSession: async (sessionId) => {
    const response = await api.post(`/api/v1/sessions/${sessionId}/revoke`);
    return response.data;
  },
};

export default api;
