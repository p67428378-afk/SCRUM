import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTodos = async (skip = 0, limit = 100) => {
  const response = await api.get("/api/v1/todos", {
    params: { skip, limit },
  });
  return response.data;
};

export const createTodo = async (todoData) => {
  const response = await api.post("/api/v1/todos", todoData);
  return response.data;
};

export const updateTodo = async (id, todoData) => {
  const response = await api.put(`/api/v1/todos/${id}`, todoData);
  return response.data;
};

export const deleteTodo = async (id) => {
  const response = await api.delete(`/api/v1/todos/${id}`);
  return response.data;
};

export default api;
