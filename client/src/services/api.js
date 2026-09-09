import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getDrugs = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/drugs", { params });
    return response.data;
  } catch (error) {
    console.error("API Error in getDrugs:", error);
    throw error;
  }
};

export const getDrugById = async (id) => {
  try {
    const response = await apiClient.get(`/api/v1/drugs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error in getDrugById (${id}):`, error);
    throw error;
  }
};

export const createDrug = async (drugData) => {
  try {
    const response = await apiClient.post("/api/v1/drugs", drugData);
    return response.data;
  } catch (error) {
    console.error("API Error in createDrug:", error);
    throw error;
  }
};

export const updateDrug = async (id, drugData) => {
  try {
    const response = await apiClient.put(`/api/v1/drugs/${id}`, drugData);
    return response.data;
  } catch (error) {
    console.error(`API Error in updateDrug (${id}):`, error);
    throw error;
  }
};

export const deleteDrug = async (id) => {
  try {
    const response = await apiClient.delete(`/api/v1/drugs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`API Error in deleteDrug (${id}):`, error);
    throw error;
  }
};

export default {
  getDrugs,
  getDrugById,
  createDrug,
  updateDrug,
  deleteDrug,
  apiClient,
};
