import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

export const getTodos = async () => {
  const response = await api.get('/api/v1/todos');
  return response.data;
};

export const createTodo = async (todo) => {
  const response = await api.post('/api/v1/todos', todo);
  return response.data;
};

export const updateTodo = async (id, todo) => {
  const response = await api.put(`/api/v1/todos/${id}`, todo);
  return response.data;
};
