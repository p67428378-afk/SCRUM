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
  login: async (email, password) => {
    const response = await api.post("/api/v1/auth/login", { email, password });
    if (response.data && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.guide));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export const bookingsService = {
  getBookings: async (params = {}) => {
    const response = await api.get("/api/v1/bookings", { params });
    return response.data;
  },
  getBookingDetails: async (bookingId) => {
    const response = await api.get(`/api/v1/bookings/${bookingId}`);
    return response.data;
  },
  updateBooking: async (bookingId, data) => {
    const response = await api.put(`/api/v1/bookings/${bookingId}`, data);
    return response.data;
  },
};

export const availabilityService = {
  getAvailability: async (params = {}) => {
    const response = await api.get("/api/v1/availability", { params });
    return response.data;
  },
  setAvailability: async (dates, isAvailable, notes = "") => {
    const response = await api.post("/api/v1/availability", {
      dates,
      is_available: isAvailable,
      notes,
    });
    return response.data;
  },
};

export const notificationsService = {
  getNotifications: async () => {
    const response = await api.get("/api/v1/notifications");
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await api.post(
      `/api/v1/notifications/${notificationId}/read`,
    );
    return response.data;
  },
};

export default api;
