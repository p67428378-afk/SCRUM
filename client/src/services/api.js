import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

// Auth API
export const loginUser = async (email, password) => {
  const response = await api.post("/api/v1/auth/login", { email, password });
  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/api/v1/auth/register", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

// Analytics API
export const getAnalyticsSummary = async () => {
  const response = await api.get("/api/v1/analytics/summary");
  return response.data;
};

// Products API
export const listProducts = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get("/api/v1/products", { params });
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/api/v1/products", productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/api/v1/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/api/v1/products/${productId}`);
  return response.data;
};

// Recipe API
export const getProductRecipes = async (productId) => {
  const response = await api.get(`/api/v1/products/${productId}/recipes`);
  return response.data;
};

export const addRecipeToProduct = async (productId, recipeData) => {
  const response = await api.post(
    `/api/v1/products/${productId}/recipes`,
    recipeData,
  );
  return response.data;
};

export const deleteRecipe = async (recipeId) => {
  const response = await api.delete(`/api/v1/recipes/${recipeId}`);
  return response.data;
};

// Ingredients API
export const listIngredients = async (lowStockOnly = false) => {
  const params = lowStockOnly ? { low_stock_only: true } : {};
  const response = await api.get("/api/v1/ingredients", { params });
  return response.data;
};

export const createIngredient = async (ingredientData) => {
  const response = await api.post("/api/v1/ingredients", ingredientData);
  return response.data;
};

export const updateIngredient = async (ingredientId, ingredientData) => {
  const response = await api.put(
    `/api/v1/ingredients/${ingredientId}`,
    ingredientData,
  );
  return response.data;
};

export const adjustIngredientStock = async (
  ingredientId,
  quantityChange,
  reason = "Manual adjustment",
) => {
  const response = await api.post(
    `/api/v1/ingredients/${ingredientId}/adjust`,
    {
      quantity_change: quantityChange,
      reason,
    },
  );
  return response.data;
};

export const deleteIngredient = async (ingredientId) => {
  const response = await api.delete(`/api/v1/ingredients/${ingredientId}`);
  return response.data;
};

// Orders API
export const listOrders = async (statusFilter = null, orderType = null) => {
  const params = {};
  if (statusFilter) params.status = statusFilter;
  if (orderType) params.order_type = orderType;
  const response = await api.get("/api/v1/orders", { params });
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post("/api/v1/orders", orderData);
  return response.data;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await api.patch(`/api/v1/orders/${orderId}/status`, {
    status: newStatus,
  });
  return response.data;
};

export const deleteOrder = async (orderId) => {
  const response = await api.delete(`/api/v1/orders/${orderId}`);
  return response.data;
};

export default api;
