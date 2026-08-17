import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPortfolio = async () => {
  const response = await apiClient.get("/api/v1/portfolio");
  return response.data;
};

export const getConcerts = async (params = {}) => {
  const response = await apiClient.get("/api/v1/concerts", { params });
  return response.data;
};

export const getConcertDetail = async (concertId) => {
  const response = await apiClient.get(`/api/v1/concerts/${concertId}`);
  return response.data;
};

export const reserveTickets = async (data) => {
  const response = await apiClient.post("/api/v1/tickets/reserve", data);
  return response.data;
};

export const createPaymentIntent = async (data) => {
  const response = await apiClient.post("/api/v1/payments/create-intent", data);
  return response.data;
};

export const bookTickets = async (data) => {
  const response = await apiClient.post("/api/v1/tickets/book", data);
  return response.data;
};

export default {
  apiClient,
  getPortfolio,
  getConcerts,
  getConcertDetail,
  reserveTickets,
  createPaymentIntent,
  bookTickets,
};
