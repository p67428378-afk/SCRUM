import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const registerUser = async (userData) => {
  const response = await api.post("/api/v1/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  // Try sending as JSON first, if backend uses OAuth2 form data fallback handles it
  try {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  } catch (err) {
    if (err.response?.status === 422 || err.response?.status === 400) {
      // Try form-urlencoded if backend expects OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append(
        "username",
        credentials.email || credentials.username || "",
      );
      formData.append("password", credentials.password || "");
      const response = await api.post("/api/v1/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    }
    throw err;
  }
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
};

export const getBooks = async (params = {}) => {
  const { query = "", genre = "", skip = 0, limit = 20 } = params;
  const queryParams = new URLSearchParams();
  if (query) queryParams.append("query", query);
  if (genre) queryParams.append("genre", genre);
  queryParams.append("skip", skip);
  queryParams.append("limit", limit);

  const response = await api.get(`/api/v1/books?${queryParams.toString()}`);
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/api/v1/books/${id}`);
  return response.data;
};

export const createBook = async (bookData) => {
  const response = await api.post("/api/v1/books", bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/api/v1/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/api/v1/books/${id}`);
  return response.data;
};

export const checkoutBook = async (bookId) => {
  const response = await api.post("/api/v1/loans/checkout", {
    book_id: bookId,
  });
  return response.data;
};

export const returnBook = async (loanId) => {
  const response = await api.post(`/api/v1/loans/return/${loanId}`);
  return response.data;
};

export const renewLoan = async (loanId) => {
  const response = await api.post(`/api/v1/loans/renew/${loanId}`);
  return response.data;
};

export const getMyLoans = async () => {
  const response = await api.get("/api/v1/loans/my-loans");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get("/api/v1/admin/analytics");
  return response.data;
};

export default api;
