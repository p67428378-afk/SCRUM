import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Initiates a P2P money transfer between sender and receiver.
 * @param {Object} payload - { sender_id: string, receiver_id: string, amount: number }
 * @returns {Promise<Object>} Transfer response record
 */
export const createTransfer = async (payload) => {
  const response = await apiClient.post("/api/v1/transfers", payload);
  return response.data;
};

/**
 * Fetches transfer history with optional filters and pagination.
 * @param {Object} [params] - { sender_id, receiver_id, user_id, skip, limit }
 * @returns {Promise<Array>} List of transfer records
 */
export const getTransfers = async (params = {}) => {
  const response = await apiClient.get("/api/v1/transfers", { params });
  return response.data;
};

/**
 * Retrieves details of a specific transfer by its unique UUID.
 * @param {string} transferId
 * @returns {Promise<Object>} Transfer record
 */
export const getTransferById = async (transferId) => {
  const response = await apiClient.get(`/api/v1/transfers/${transferId}`);
  return response.data;
};

/**
 * Retrieves the available balance for a user or account identifier.
 * @param {string} identifier
 * @returns {Promise<Object>} Balance info
 */
export const getBalance = async (identifier) => {
  const response = await apiClient.get(
    `/api/v1/accounts/balance/${identifier}`,
  );
  return response.data;
};

/**
 * Retrieves all registered users and linked accounts.
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async () => {
  const response = await apiClient.get("/api/v1/accounts/users");
  return response.data;
};

/**
 * Retrieves all registered accounts.
 * @returns {Promise<Array>} List of accounts
 */
export const getAccounts = async () => {
  const response = await apiClient.get("/api/v1/accounts");
  return response.data;
};

/**
 * Deposits funds into an account.
 * @param {string} accountId
 * @param {number} amount
 * @returns {Promise<Object>} Updated account
 */
export const depositFunds = async (accountId, amount) => {
  const response = await apiClient.post(
    `/api/v1/accounts/${accountId}/deposit`,
    { amount },
  );
  return response.data;
};

/**
 * Service health check.
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await apiClient.get("/api/v1/health");
  return response.data;
};

export default {
  createTransfer,
  getTransfers,
  getTransferById,
  getBalance,
  getUsers,
  getAccounts,
  depositFunds,
  checkHealth,
};
