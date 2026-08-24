import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if present
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

export const authAPI = {
  register: async (data) => {
    const response = await api.post("/api/v1/auth/register", data);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/api/v1/auth/me");
    return response.data;
  },
};

export const poojaAPI = {
  listPoojas: async (skip = 0, limit = 50) => {
    const response = await api.get(
      `/api/v1/poojas?skip=${skip}&limit=${limit}`,
    );
    return response.data;
  },
  listSlots: async (poojaId, slotDate = null) => {
    let url = `/api/v1/poojas/${poojaId}/slots`;
    if (slotDate) {
      url += `?slot_date=${slotDate}`;
    }
    const response = await api.get(url);
    return response.data;
  },
};

export const bookingAPI = {
  createBooking: async (data) => {
    const response = await api.post("/api/v1/bookings", data);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get("/api/v1/bookings/my-bookings");
    return response.data;
  },
  cancelBooking: async (bookingId) => {
    const response = await api.post(`/api/v1/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

export const donationAPI = {
  createDonation: async (data) => {
    const response = await api.post("/api/v1/donations", data);
    return response.data;
  },
  listDonations: async (skip = 0, limit = 100) => {
    const response = await api.get(
      `/api/v1/donations?skip=${skip}&limit=${limit}`,
    );
    return response.data;
  },
  getMyDonations: async () => {
    const response = await api.get("/api/v1/donations/my-donations");
    return response.data;
  },
  getReceiptUrl: (donationId) => {
    return `${BASE_URL}/api/v1/donations/${donationId}/receipt`;
  },
  downloadReceipt: async (donationId, receiptNumber = "receipt") => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `${BASE_URL}/api/v1/donations/${donationId}/receipt`,
      {
        responseType: "blob",
        headers,
      },
    );

    // Create download link
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${receiptNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get("/api/v1/admin/dashboard");
    return response.data;
  },
  getFinancialReport: async () => {
    const response = await api.get("/api/v1/admin/financial-report");
    return response.data;
  },
  listAnnouncements: async () => {
    const response = await api.get("/api/v1/admin/announcements");
    return response.data;
  },
  createAnnouncement: async (data) => {
    const response = await api.post("/api/v1/admin/announcements", data);
    return response.data;
  },
  createRitual: async (data) => {
    const response = await api.post("/api/v1/admin/rituals", data);
    return response.data;
  },
};

export default api;
