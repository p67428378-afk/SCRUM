
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAnnouncements = (params) => {
  return apiClient.get('/api/v1/announcements', { params });
};

export const getAnnouncementById = (id) => {
  return apiClient.get(`/api/v1/announcements/${id}`);
};

export const getEvents = (params) => {
  return apiClient.get('/api/v1/events', { params });
};

export const getEventById = (id) => {
  return apiClient.get(`/api/v1/events/${id}`);
};
