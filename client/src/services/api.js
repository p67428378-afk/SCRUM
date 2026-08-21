import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getRecipes = async (skip = 0, limit = 20, search = "") => {
  try {
    const params = { skip, limit };
    if (search) {
      params.search = search;
    }
    const response = await api.get("/api/v1/recipes", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

export const getRecipe = async (id) => {
  try {
    const response = await api.get(`/api/v1/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw error;
  }
};

export const createRecipe = async (recipeData) => {
  try {
    const response = await api.post("/api/v1/recipes", recipeData);
    return response.data;
  } catch (error) {
    console.error("Error creating recipe:", error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    await api.delete(`/api/v1/recipes/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting recipe ${id}:`, error);
    throw error;
  }
};

export default api;
