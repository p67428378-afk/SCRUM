import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const createTransfer = async (transferData) => {
  try {
    const response = await api.post("/api/v1/transfers", transferData);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const detail = error.response.data.detail;
      const errorMessage =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(", ")
            : "Transfer failed";
      throw new Error(errorMessage);
    }
    throw new Error(error.message || "Network error occurred");
  }
};

export const getBalance = async (accountId) => {
  try {
    const response = await api.get(`/api/v1/balance/${accountId}`);
    return response.data;
  } catch (error) {
    // Try fallback route if initial fails
    try {
      const fallbackResponse = await api.get(
        `/api/v1/accounts/${accountId}/balance`,
      );
      return fallbackResponse.data;
    } catch (fallbackError) {
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("Failed to fetch account balance");
    }
  }
};

export const getTransfers = async (params = {}) => {
  try {
    const response = await api.get("/api/v1/transfers", { params });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch transaction history");
  }
};
