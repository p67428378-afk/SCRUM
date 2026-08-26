import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const formatApiError = (error) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data.detail === "string") {
      return error.response.data.detail;
    }
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map((err) => err.msg || JSON.stringify(err))
        .join(", ");
    }
  }
  return error.message || "An unexpected error occurred";
};

// Expenses API
export const getExpenses = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = value;
    }
  });
  const response = await api.get("/api/v1/expenses", { params: cleanParams });
  return response.data;
};

export const getExpense = async (id) => {
  const response = await api.get(`/api/v1/expenses/${id}`);
  return response.data;
};

export const createExpense = async (data) => {
  const payload = {
    amount: Number(data.amount),
    type: data.type,
    date: data.date,
    description: data.description,
    category_id: data.category_id,
    payment_method: data.payment_method || null,
  };
  const response = await api.post("/api/v1/expenses", payload);
  return response.data;
};

export const updateExpense = async (id, data) => {
  const payload = {};
  if (data.amount !== undefined && data.amount !== null) {
    payload.amount = Number(data.amount);
  }
  if (data.type !== undefined) payload.type = data.type;
  if (data.date !== undefined) payload.date = data.date;
  if (data.description !== undefined) payload.description = data.description;
  if (data.category_id !== undefined) payload.category_id = data.category_id;
  if (data.payment_method !== undefined)
    payload.payment_method = data.payment_method;

  const response = await api.put(`/api/v1/expenses/${id}`, payload);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/api/v1/expenses/${id}`);
  return response.data;
};

// Categories API
export const getCategories = async (type = null) => {
  const params = type ? { type } : {};
  const response = await api.get("/api/v1/categories", { params });
  return response.data;
};

export const createCategory = async (data) => {
  const payload = {
    name: data.name,
    type: data.type,
    is_predefined: Boolean(data.is_predefined),
  };
  const response = await api.post("/api/v1/categories", payload);
  return response.data;
};

// Summary API
export const getSummary = async (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = value;
    }
  });
  const response = await api.get("/api/v1/summary", { params: cleanParams });
  return response.data;
};

// Health Check API
export const getHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
