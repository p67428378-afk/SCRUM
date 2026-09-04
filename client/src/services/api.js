import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getBooks = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (
    params.query !== undefined &&
    params.query !== null &&
    params.query !== ""
  ) {
    queryParams.append("query", params.query);
  }
  if (
    params.category !== undefined &&
    params.category !== null &&
    params.category !== "" &&
    params.category !== "All"
  ) {
    queryParams.append("category", params.category);
  }
  if (
    params.in_stock !== undefined &&
    params.in_stock !== null &&
    params.in_stock !== ""
  ) {
    queryParams.append("in_stock", params.in_stock);
  }
  if (params.skip !== undefined && params.skip !== null) {
    queryParams.append("skip", params.skip);
  }
  if (params.limit !== undefined && params.limit !== null) {
    queryParams.append("limit", params.limit);
  }

  const response = await api.get("/api/v1/books", { params: queryParams });
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/api/v1/books/${id}`);
  return response.data;
};

export const createBook = async (bookData) => {
  const payload = {
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    category: bookData.category,
    publication_year: parseInt(bookData.publication_year, 10),
    price: parseFloat(bookData.price),
    stock_quantity: parseInt(bookData.stock_quantity, 10),
    description: bookData.description || "",
  };
  const response = await api.post("/api/v1/books", payload);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const payload = {
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    category: bookData.category,
    publication_year: parseInt(bookData.publication_year, 10),
    price: parseFloat(bookData.price),
    stock_quantity: parseInt(bookData.stock_quantity, 10),
    description: bookData.description || "",
  };
  const response = await api.put(`/api/v1/books/${id}`, payload);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/api/v1/books/${id}`);
  return response.data;
};

export default api;
