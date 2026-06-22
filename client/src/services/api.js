import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getResident = async (id) => {
  const response = await api.get(`/api/v1/residents/${id}`);
  return response.data;
};

export const updateResident = async (id, data) => {
  const response = await api.put(`/api/v1/residents/${id}`, data);
  return response.data;
};

export const getBills = async (residentId) => {
  const response = await api.get("/api/v1/bills", {
    params: { resident_id: residentId },
  });
  return response.data;
};

export const makePayment = async (data) => {
  const response = await api.post("/api/v1/payments", data);
  return response.data;
};

export const getAnnouncements = async () => {
  const response = await api.get("/api/v1/announcements");
  return response.data;
};

export const getDiscussions = async () => {
  const response = await api.get("/api/v1/discussions");
  return response.data;
};

export const postComment = async (discussionId, data) => {
  const response = await api.post(
    `/api/v1/discussions/${discussionId}/comments`,
    data,
  );
  return response.data;
};

export const getFacilities = async () => {
  const response = await api.get("/api/v1/facilities");
  return response.data;
};

export const getFacilityAvailability = async (facilityId, date) => {
  const response = await api.get(
    `/api/v1/facilities/${facilityId}/availability`,
    {
      params: { date },
    },
  );
  return response.data;
};

export const bookFacility = async (data) => {
  const response = await api.post("/api/v1/bookings", data);
  return response.data;
};

export const getBookings = async (residentId) => {
  const response = await api.get("/api/v1/bookings", {
    params: { resident_id: residentId },
  });
  return response.data;
};

export const preApproveVisitor = async (data) => {
  const response = await api.post("/api/v1/visitors/pre-approve", data);
  return response.data;
};

export const getVisitorLog = async (residentId) => {
  const response = await api.get("/api/v1/visitors/log", {
    params: { resident_id: residentId },
  });
  return response.data;
};

export const createMaintenanceRequest = async (data) => {
  const response = await api.post("/api/v1/maintenance-requests", data);
  return response.data;
};

export const getMaintenanceRequests = async (residentId) => {
  const response = await api.get("/api/v1/maintenance-requests", {
    params: { resident_id: residentId },
  });
  return response.data;
};

export default api;
