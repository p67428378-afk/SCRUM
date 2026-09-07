import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getLocations = async (search = "") => {
  const response = await api.get("/api/v1/locations", {
    params: search ? { search } : {},
  });
  return response.data;
};

export const getLocationById = async (id) => {
  const response = await api.get(`/api/v1/locations/${id}`);
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await api.post("/api/v1/locations", locationData);
  return response.data;
};

export const ingestWeatherData = async (weatherData) => {
  const response = await api.post("/api/v1/weather", weatherData);
  return response.data;
};

export const getCurrentWeather = async (locationId = null) => {
  const params = locationId ? { location_id: locationId } : {};
  const response = await api.get("/api/v1/weather/current", { params });
  return response.data;
};

export const getWeatherHistory = async (
  locationId,
  startDate = null,
  endDate = null,
) => {
  const params = { location_id: locationId };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get("/api/v1/weather/history", { params });
  return response.data;
};

export const getForecasts = async (locationId) => {
  const params = locationId ? { location_id: locationId } : {};
  const response = await api.get("/api/v1/forecasts", { params });
  return response.data;
};

export const getAlertConfigs = async () => {
  const response = await api.get("/api/v1/alerts/configs");
  return response.data;
};

export const createAlertConfig = async (configData) => {
  const response = await api.post("/api/v1/alerts/configs", configData);
  return response.data;
};

export const getAlertNotifications = async () => {
  const response = await api.get("/api/v1/alerts/notifications");
  return response.data;
};

export default api;
