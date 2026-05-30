import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Book endpoints
export const getBooks = (params) => api.get('/api/v1/books', { params });
export const addBook = (book) => api.post('/api/v1/books', book);

// Patron endpoints
export const getPatrons = (params) => api.get('/api/v1/patrons', { params });
export const addPatron = (patron) => api.post('/api/v1/patrons', patron);

// Loan endpoints
export const lendBook = (loan) => api.post('/api/v1/loans', loan);
export const returnBook = (loanId) => api.put(`/api/v1/loans/${loanId}/return`);

// Search endpoint
export const searchBooks = (params) => api.get('/api/v1/search', { params });

export default api;
