import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAccounts = async (skip = 0, limit = 100) => {
  const response = await apiClient.get("/api/v1/accounts", {
    params: { skip, limit },
  });
  return response.data;
};

export const getAccountById = async (accountId) => {
  const response = await apiClient.get(`/api/v1/accounts/${accountId}`);
  return response.data;
};

export const createAccount = async (accountData) => {
  const response = await apiClient.post("/api/v1/accounts", accountData);
  return response.data;
};

export const createTransfer = async ({ sender_id, receiver_id, amount }) => {
  try {
    const response = await apiClient.post("/api/v1/transfers", {
      sender_id,
      receiver_id,
      amount: parseFloat(amount),
    });
    return response.data;
  } catch (error) {
    let message = "Transfer failed. Please check details and try again.";
    if (error.response && error.response.data) {
      if (typeof error.response.data.detail === "string") {
        message = error.response.data.detail;
      } else if (Array.isArray(error.response.data.detail)) {
        message = error.response.data.detail
          .map((err) => err.msg || err)
          .join("; ");
      }
    } else if (error.message) {
      message = error.message;
    }
    const errObj = new Error(message);
    errObj.response = error.response;
    throw errObj;
  }
};

export const getTransfers = async (skip = 0, limit = 100) => {
  const response = await apiClient.get("/api/v1/transfers", {
    params: { skip, limit },
  });
  return response.data;
};

export const getTransferById = async (transferId) => {
  const response = await apiClient.get(`/api/v1/transfers/${transferId}`);
  return response.data;
};

export default {
  getAccounts,
  getAccountById,
  createAccount,
  createTransfer,
  getTransfers,
  getTransferById,
};
