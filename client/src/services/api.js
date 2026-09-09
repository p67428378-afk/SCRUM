import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add request interceptor for auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("actor_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const getActorProfile = async () => {
  try {
    const response = await api.get("/api/v1/actors/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching actor profile:", error);
    throw error;
  }
};

export const updateActorProfile = async (profileData) => {
  try {
    const response = await api.put("/api/v1/actors/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating actor profile:", error);
    throw error;
  }
};

export const requestUploadUrl = async (fileName, fileType) => {
  try {
    const response = await api.post("/api/v1/actors/media/upload-url", {
      file_name: fileName,
      file_type: fileType,
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting upload URL:", error);
    throw error;
  }
};

export const createMediaAsset = async (mediaData) => {
  try {
    const response = await api.post("/api/v1/actors/media", mediaData);
    return response.data;
  } catch (error) {
    console.error("Error creating media asset:", error);
    throw error;
  }
};

export const setPrimaryHeadshot = async (mediaId) => {
  try {
    const response = await api.put(`/api/v1/actors/media/${mediaId}/primary`);
    return response.data;
  } catch (error) {
    console.error("Error setting primary headshot:", error);
    throw error;
  }
};

export const deleteMediaAsset = async (mediaId) => {
  try {
    const response = await api.delete(`/api/v1/actors/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting media asset:", error);
    throw error;
  }
};

export const getCredits = async () => {
  try {
    const response = await api.get("/api/v1/actors/credits");
    return response.data;
  } catch (error) {
    console.error("Error fetching credits:", error);
    throw error;
  }
};

export const addCredit = async (creditData) => {
  try {
    const response = await api.post("/api/v1/actors/credits", creditData);
    return response.data;
  } catch (error) {
    console.error("Error adding credit:", error);
    throw error;
  }
};

export const deleteCredit = async (creditId) => {
  try {
    const response = await api.delete(`/api/v1/actors/credits/${creditId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting credit:", error);
    throw error;
  }
};

export const getPublicPortfolio = async (slug) => {
  try {
    const response = await api.get(`/api/v1/public/actors/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching public portfolio for slug ${slug}:`, error);
    throw error;
  }
};

export default api;
