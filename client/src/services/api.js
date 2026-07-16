import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
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
  login: async (username, password) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const response = await api.post("/api/v1/auth/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (response.data.access_token) {
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
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const roomService = {
  getRooms: async (filters = {}) => {
    const response = await api.get("/api/v1/rooms", { params: filters });
    return response.data;
  },

  updateStatus: async (roomId, status) => {
    const response = await api.put(`/api/v1/rooms/${roomId}/status`, {
      status,
    });
    return response.data;
  },
};

export const bookingService = {
  getBookings: async () => {
    const response = await api.get("/api/v1/bookings");
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post("/api/v1/bookings", bookingData);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/api/v1/bookings/${bookingId}`);
    return response.data;
  },
};

export const userService = {
  createUser: async (userData) => {
    const response = await api.post("/api/v1/users", userData);
    return response.data;
  },

  updateRole: async (userId, role) => {
    const response = await api.put(`/api/v1/users/${userId}/role`, { role });
    return response.data;
  },
};

export default api;
