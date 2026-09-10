import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createTransfer = async (transferData) => {
  const response = await api.post("/api/v1/transfers", transferData);
  return response.data;
};

export const listTransfers = async (params = {}) => {
  const response = await api.get("/api/v1/transfers", { params });
  return response.data;
};

export const getTransferById = async (id) => {
  const response = await api.get(`/api/v1/transfers/${id}`);
  return response.data;
};

export const listAccounts = async () => {
  const response = await api.get("/api/v1/accounts");
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await api.get("/api/v1/accounts/users/me");
  return response.data;
};

export const getAccountById = async (id) => {
  const response = await api.get(`/api/v1/accounts/${id}`);
  return response.data;
};

export default api;
