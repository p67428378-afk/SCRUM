import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const transferMoney = async ({ sender_id, receiver_id, amount }) => {
  const response = await apiClient.post("/api/v1/transfers", {
    sender_id,
    receiver_id,
    amount: parseFloat(amount),
  });
  return response.data;
};

export const fetchAccounts = async () => {
  const response = await apiClient.get("/api/v1/transfers/accounts");
  return response.data;
};

export const fetchAccountById = async (accountId) => {
  const response = await apiClient.get(
    `/api/v1/transfers/accounts/${accountId}`,
  );
  return response.data;
};

export const fetchTransfers = async () => {
  const response = await apiClient.get("/api/v1/transfers");
  return response.data;
};
