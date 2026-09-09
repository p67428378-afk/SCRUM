import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for auth expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized, except for login attempts
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  },
);

// Auth Services
export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post("/api/v1/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },
  updateMe: async (userData) => {
    const response = await apiClient.put("/api/v1/auth/me", userData);
    return response.data;
  },
  getPatrons: async (skip = 0, limit = 100) => {
    const response = await apiClient.get("/api/v1/patrons", {
      params: { skip, limit },
    });
    return response.data;
  },
  getPatron: async (id) => {
    const response = await apiClient.get(`/api/v1/patrons/${id}`);
    return response.data;
  },
  updatePatron: async (id, userData) => {
    const response = await apiClient.put(`/api/v1/patrons/${id}`, userData);
    return response.data;
  },
};

// Books Services
export const booksApi = {
  getBooks: async (params = {}) => {
    const response = await apiClient.get("/api/v1/books", { params });
    return response.data;
  },
  getBook: async (id) => {
    const response = await apiClient.get(`/api/v1/books/${id}`);
    return response.data;
  },
  createBook: async (bookData) => {
    const response = await apiClient.post("/api/v1/books", bookData);
    return response.data;
  },
  updateBook: async (id, bookData) => {
    const response = await apiClient.put(`/api/v1/books/${id}`, bookData);
    return response.data;
  },
  deleteBook: async (id) => {
    const response = await apiClient.delete(`/api/v1/books/${id}`);
    return response.data;
  },
};

// Loans Services
export const loansApi = {
  checkout: async ({ book_id, patron_id }) => {
    const response = await apiClient.post("/api/v1/loans/checkout", {
      book_id,
      patron_id,
    });
    return response.data;
  },
  returnBook: async (loan_id) => {
    const response = await apiClient.post(`/api/v1/loans/return/${loan_id}`);
    return response.data;
  },
  renewLoan: async (loan_id) => {
    const response = await apiClient.post(`/api/v1/loans/renew/${loan_id}`);
    return response.data;
  },
  getOverdueLoans: async () => {
    const response = await apiClient.get("/api/v1/loans/overdue");
    return response.data;
  },
  getPatronLoans: async (patron_id) => {
    const response = await apiClient.get(`/api/v1/patrons/${patron_id}/loans`);
    return response.data;
  },
  getAllLoans: async (skip = 0, limit = 100) => {
    const response = await apiClient.get("/api/v1/loans", {
      params: { skip, limit },
    });
    return response.data;
  },
};

export default {
  auth: authApi,
  books: booksApi,
  loans: loansApi,
};
