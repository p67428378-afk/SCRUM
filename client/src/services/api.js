import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const kycService = {
  submitOnboarding: async (data) => {
    const response = await api.post('/api/kyc/onboarding', data);
    return response.data;
  },

  getRequests: async (params = {}) => {
    const response = await api.get('/api/kyc/requests', { params });
    return response.data;
  },

  getRequestDetail: async (id) => {
    const response = await api.get(`/api/kyc/requests/${id}`);
    return response.data;
  },
};

export default api;