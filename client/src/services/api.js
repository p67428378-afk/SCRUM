import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerAlert = async (data) => {
  const response = await api.post("/api/v1/alerts/register", data);
  return response.data;
};

export const sendOtp = async (data) => {
  const response = await api.post("/api/v1/otp/send", data);
  return response.data;
};

export const verifyOtp = async (data) => {
  const response = await api.post("/api/v1/otp/verify", data);
  return response.data;
};

export const getActiveAlerts = async () => {
  const response = await api.get("/api/v1/alerts");
  return response.data;
};

export default api;
