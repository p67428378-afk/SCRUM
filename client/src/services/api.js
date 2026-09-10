import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization token if available in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth endpoints
  login: async (credentials) => {
    const res = await apiClient.post("/api/v1/auth/login", credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post("/api/v1/auth/register", userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get("/api/v1/auth/me");
    return res.data;
  },

  // Books endpoints
  getBooks: async (params = {}) => {
    const res = await apiClient.get("/api/v1/books", { params });
    return res.data;
  },
  getBookById: async (bookId) => {
    const res = await apiClient.get(`/api/v1/books/${bookId}`);
    return res.data;
  },
  createBook: async (bookData) => {
    const res = await apiClient.post("/api/v1/books", bookData);
    return res.data;
  },
  updateBook: async (bookId, bookData) => {
    const res = await apiClient.put(`/api/v1/books/${bookId}`, bookData);
    return res.data;
  },
  deleteBook: async (bookId) => {
    const res = await apiClient.delete(`/api/v1/books/${bookId}`);
    return res.data;
  },

  // Members endpoints
  getMembers: async (params = {}) => {
    const res = await apiClient.get("/api/v1/members", { params });
    return res.data;
  },
  getMemberById: async (memberId) => {
    const res = await apiClient.get(`/api/v1/members/${memberId}`);
    return res.data;
  },
  createMember: async (memberData) => {
    const res = await apiClient.post("/api/v1/members", memberData);
    return res.data;
  },
  updateMember: async (memberId, memberData) => {
    const res = await apiClient.put(`/api/v1/members/${memberId}`, memberData);
    return res.data;
  },

  // Loans endpoints
  getMyLoans: async () => {
    const res = await apiClient.get("/api/v1/loans/my-loans");
    return res.data;
  },
  getLoans: async (params = {}) => {
    const res = await apiClient.get("/api/v1/loans", { params });
    return res.data;
  },
  getLoanById: async (loanId) => {
    const res = await apiClient.get(`/api/v1/loans/${loanId}`);
    return res.data;
  },
  checkoutBook: async (checkoutData) => {
    const res = await apiClient.post("/api/v1/loans/checkout", checkoutData);
    return res.data;
  },
  returnBook: async (loanId) => {
    const res = await apiClient.post(`/api/v1/loans/${loanId}/return`);
    return res.data;
  },
  renewLoan: async (loanId) => {
    const res = await apiClient.post(`/api/v1/loans/${loanId}/renew`);
    return res.data;
  },

  // Fines endpoints
  payFine: async (targetId, amountPaid) => {
    const res = await apiClient.post(`/api/v1/fines/${targetId}/pay`, {
      amount_paid: Number(amountPaid),
    });
    return res.data;
  },
  getMemberFines: async (memberId) => {
    const res = await apiClient.get(`/api/v1/fines/members/${memberId}`);
    return res.data;
  },
  recalculateOverdueFines: async () => {
    const res = await apiClient.post("/api/v1/tasks/recalculate-overdue-fines");
    return res.data;
  },
};

export default apiClient;
