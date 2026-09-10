import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const formatApiError = (error) => {
  if (error.response && error.response.data) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((err) => `${err.loc?.join(".") || "field"}: ${err.msg}`)
        .join(", ");
    }
    if (detail && typeof detail === "object") {
      return JSON.stringify(detail);
    }
  }
  return error.message || "An unexpected error occurred. Please try again.";
};

export const initiateTransfer = async (transferData) => {
  try {
    const response = await apiClient.post("/api/v1/transfers", {
      sender_id: transferData.sender_id,
      receiver_id: transferData.receiver_id,
      amount: parseFloat(transferData.amount),
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = formatApiError(error);
    return { success: false, error: errorMessage };
  }
};

export const fetchTransfers = async (skip = 0, limit = 20) => {
  try {
    const response = await apiClient.get("/api/v1/transfers", {
      params: { skip, limit },
    });
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = formatApiError(error);
    return { success: false, error: errorMessage };
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await apiClient.get("/api/v1/accounts");
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = formatApiError(error);
    return { success: false, error: errorMessage };
  }
};
