import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Auth Services
export const loginUser = async (email, password) => {
  const response = await api.post("/api/v1/auth/login", { email, password });
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/api/v1/auth/register", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

// Resident Directory Services
export const getResidents = async () => {
  const response = await api.get("/api/v1/residents");
  return response.data;
};

export const updateResident = async (id, data) => {
  const response = await api.put(`/api/v1/residents/${id}`, data);
  return response.data;
};

// Facility & Booking Services
export const getFacilities = async () => {
  const response = await api.get("/api/v1/facilities");
  return response.data;
};

export const createFacility = async (facilityData) => {
  const response = await api.post("/api/v1/facilities", facilityData);
  return response.data;
};

export const getBookings = async () => {
  const response = await api.get("/api/v1/bookings");
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post("/api/v1/bookings", bookingData);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.delete(`/api/v1/bookings/${id}`);
  return response.data;
};

// Announcement Services
export const getAnnouncements = async () => {
  const response = await api.get("/api/v1/announcements");
  return response.data;
};

export const createAnnouncement = async (announcementData) => {
  const response = await api.post("/api/v1/announcements", announcementData);
  return response.data;
};

export const archiveAnnouncement = async (id) => {
  const response = await api.patch(`/api/v1/announcements/${id}/archive`);
  return response.data;
};

// Service Request Services
export const getServiceRequests = async () => {
  const response = await api.get("/api/v1/service-requests");
  return response.data;
};

export const createServiceRequest = async (requestData) => {
  const response = await api.post("/api/v1/service-requests", requestData);
  return response.data;
};

export const updateServiceRequestStatus = async (id, status) => {
  const response = await api.patch(`/api/v1/service-requests/${id}/status`, {
    status,
  });
  return response.data;
};

export const assignServiceRequestStaff = async (id, staff_id) => {
  const response = await api.patch(`/api/v1/service-requests/${id}/assign`, {
    assigned_staff_id: staff_id,
  });
  return response.data;
};

export default api;
