import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const weatherApi = {
  getCurrent: async (location) => {
    const response = await api.get("/api/v1/weather/current", {
      params: { location },
    });
    return response.data;
  },
  getForecast: async (location, days = 5) => {
    const response = await api.get("/api/v1/weather/forecast", {
      params: { location, days },
    });
    return response.data;
  },
  getInsights: async (location) => {
    const response = await api.get("/api/v1/weather/insights", {
      params: { location },
    });
    return response.data;
  },
};

export const locationsApi = {
  list: async () => {
    const response = await api.get("/api/v1/locations");
    return response.data;
  },
  create: async (locationData) => {
    const response = await api.post("/api/v1/locations", locationData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/v1/locations/${id}`);
    return response.data;
  },
  setDefault: async (id) => {
    const response = await api.put(`/api/v1/locations/${id}/default`);
    return response.data;
  },
};

export default api;
