import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Services
export const getServices = async () => {
  const response = await api.get("/api/v1/services");
  return response.data;
};

// Staff
export const getStaff = async () => {
  const response = await api.get("/api/v1/staff");
  return response.data;
};

export const getStaffById = async (id) => {
  const response = await api.get(`/api/v1/staff/${id}`);
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post("/api/v1/staff", staffData);
  return response.data;
};

// Appointments
export const getAvailableSlots = async (serviceId, staffId, date) => {
  const response = await api.get("/api/v1/appointments/available-slots", {
    params: { service_id: serviceId, staff_id: staffId, date },
  });
  return response.data;
};

export const getAppointments = async () => {
  const response = await api.get("/api/v1/appointments");
  return response.data;
};

export const createAppointment = async (bookingData) => {
  const response = await api.post("/api/v1/appointments", bookingData);
  return response.data;
};

export const cancelAppointment = async (id, reason) => {
  const response = await api.patch(`/api/v1/appointments/${id}/cancel`, {
    cancellation_reason: reason,
  });
  return response.data;
};

// Customers
export const getCustomers = async () => {
  const response = await api.get("/api/v1/customers");
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await api.get(`/api/v1/customers/${id}`);
  return response.data;
};

export const getCustomerHistory = async (id) => {
  const response = await api.get(`/api/v1/customers/${id}/history`);
  return response.data;
};

export const redeemLoyaltyPoints = async (id, points, rewardType) => {
  const response = await api.post(`/api/v1/customers/${id}/redeem-loyalty`, {
    points,
    reward_type: rewardType,
  });
  return response.data;
};
