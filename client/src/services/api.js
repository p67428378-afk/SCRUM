import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

export const searchProducts = async ({
  q = "",
  limit = 10,
  page = 1,
  category_id = null,
} = {}) => {
  const params = {
    q,
    limit,
    page,
  };
  if (category_id) {
    params.category_id = category_id;
  }

  const response = await apiClient.get("/api/v1/products/search", { params });
  return response.data;
};

export const getCategories = async () => {
  const response = await apiClient.get("/api/v1/categories");
  return response.data;
};

export const getProducts = async ({
  skip = 0,
  limit = 20,
  category_id = null,
} = {}) => {
  const params = { skip, limit };
  if (category_id) {
    params.category_id = category_id;
  }
  const response = await apiClient.get("/api/v1/products", { params });
  return response.data;
};

export default apiClient;
