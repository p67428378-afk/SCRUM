import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data?.access_token) {
      localStorage.setItem("token", response.data.access_token);
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const propertiesApi = {
  getProperties: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== "" &&
        params[key] !== null &&
        params[key] !== undefined
      ) {
        cleanParams[key] = params[key];
      }
    });
    const response = await api.get("/properties", { params: cleanParams });
    return response.data;
  },
  getPropertyById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  getPriceHistory: async (id) => {
    const response = await api.get(`/properties/${id}/price-history`);
    return response.data;
  },
  createProperty: async (propertyData) => {
    const response = await api.post("/properties", propertyData);
    return response.data;
  },
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  },
  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },
  addImage: async (id, imageData) => {
    const response = await api.post(`/properties/${id}/images`, imageData);
    return response.data;
  },
};

export const analyticsApi = {
  getCmaAnalytics: async (params = {}) => {
    const cleanParams = {};
    if (params.city) cleanParams.city = params.city;
    if (params.zip_code) cleanParams.zip_code = params.zip_code;
    const response = await api.get("/analytics/cma", { params: cleanParams });
    return response.data;
  },
};

export const favoritesApi = {
  getFavorites: async () => {
    const response = await api.get("/favorites");
    return response.data;
  },
  addFavorite: async (propertyId) => {
    const response = await api.post(`/favorites/${propertyId}`);
    return response.data;
  },
  removeFavorite: async (propertyId) => {
    const response = await api.delete(`/favorites/${propertyId}`);
    return response.data;
  },
};

export const savedSearchesApi = {
  getSavedSearches: async () => {
    const response = await api.get("/saved-searches");
    return response.data;
  },
  createSavedSearch: async (data) => {
    const response = await api.post("/saved-searches", data);
    return response.data;
  },
  deleteSavedSearch: async (id) => {
    const response = await api.delete(`/saved-searches/${id}`);
    return response.data;
  },
};

export default api;
