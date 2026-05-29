
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = async (userData) => {
  const response = await api.post('/api/v1/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/api/v1/auth/login', credentials);
  return response.data;
};

// Cars
export const getAvailableCars = async () => {
  const response = await api.get('/api/v1/cars/availability');
  return response.data;
};

export const getCarDetails = async (carId) => {
  const response = await api.get(`/api/v1/cars/${carId}/details`);
  return response.data;
};

// Bookings
export const createBooking = async (bookingData) => {
  const response = await api.post('/api/v1/bookings', bookingData);
  return response.data;
};

export const getBookingConfirmation = async (rentalId) => {
  const response = await api.get(`/api/v1/bookings/${rentalId}`);
  return response.data;
};

// Payments
export const processPayment = async (paymentData) => {
  const response = await api.post('/api/v1/payments', paymentData);
  return response.data;
};

export default api;
