import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const createTransfer = async ({ sender_id, receiver_id, amount }) => {
  const response = await apiClient.post("/transfers", {
    sender_id,
    receiver_id,
    amount: Number(amount),
  });
  return response.data;
};

export const getTransfers = async ({ skip = 0, limit = 50 } = {}) => {
  const response = await apiClient.get("/transfers", {
    params: { skip, limit },
  });
  return response.data;
};

export const getTransferById = async (transferId) => {
  const response = await apiClient.get(`/transfers/${transferId}`);
  return response.data;
};

export const getAllAccounts = async () => {
  const response = await apiClient.get("/accounts");
  return response.data;
};

export const getAccountById = async (accountId) => {
  const response = await apiClient.get(`/accounts/${accountId}`);
  return response.data;
};

export const checkHealth = async () => {
  const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
  return response.data;
};

export default {
  createTransfer,
  getTransfers,
  getTransferById,
  getAllAccounts,
  getAccountById,
  checkHealth,
};
