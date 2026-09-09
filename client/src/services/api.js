import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore storage access errors
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for auth expiration handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response && error.response.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/auth/login")) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  },
);

const unwrapArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.books)) return data.books;
  if (data && Array.isArray(data.loans)) return data.loans;
  if (data && Array.isArray(data.patrons)) return data.patrons;
  return [];
};

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
    try {
      const response = await apiClient.get("/api/v1/patrons", {
        params: { skip, limit },
      });
      return unwrapArray(response.data);
    } catch {
      return [];
    }
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
    try {
      const response = await apiClient.get("/api/v1/books", { params });
      return unwrapArray(response.data);
    } catch {
      return [];
    }
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
    try {
      const response = await apiClient.get("/api/v1/loans/overdue");
      return unwrapArray(response.data);
    } catch {
      return [];
    }
  },
  getPatronLoans: async (patron_id) => {
    try {
      const response = await apiClient.get(
        `/api/v1/patrons/${patron_id}/loans`,
      );
      return unwrapArray(response.data);
    } catch {
      return [];
    }
  },
  getAllLoans: async (skip = 0, limit = 100) => {
    try {
      const response = await apiClient.get("/api/v1/loans", {
        params: { skip, limit },
      });
      return unwrapArray(response.data);
    } catch {
      return [];
    }
  },
};

export default {
  auth: authApi,
  books: booksApi,
  loans: loansApi,
};
