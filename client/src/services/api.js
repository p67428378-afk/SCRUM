import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchRegions = async (type = "all", query = "") => {
  try {
    const params = {};
    if (type && type !== "all") {
      params.type = type;
    }
    if (query && query.trim() !== "") {
      params.q = query.trim();
    }
    const response = await apiClient.get("/api/v1/regions", { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    throw error;
  }
};

export const fetchRegionByName = async (name) => {
  try {
    const response = await apiClient.get("/api/v1/regions", {
      params: { q: name },
    });
    const regions = response.data;
    return (
      regions.find((r) => r.name.toLowerCase() === name.toLowerCase()) ||
      regions[0] ||
      null
    );
  } catch (error) {
    console.error(`Failed to fetch region detail for ${name}:`, error);
    throw error;
  }
};

export default apiClient;
