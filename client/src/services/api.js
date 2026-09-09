import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_PREFIX = `${BASE_URL}/api/v1`;

export const api = axios.create({
  baseURL: API_PREFIX,
  headers: {
    "Content-Type": "application/json",
  },
});

// Zones
export const fetchZones = async (params = {}) => {
  try {
    const response = await api.get("/zones", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw error;
  }
};

// Utility Metrics for Zone
export const fetchZoneUtilityMetrics = async (zoneId) => {
  try {
    const response = await api.get(`/zones/${zoneId}/utility-metrics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching utility metrics for zone ${zoneId}:`, error);
    throw error;
  }
};

// Service Requests
export const fetchServiceRequests = async (params = {}) => {
  try {
    const response = await api.get("/service-requests", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching service requests:", error);
    throw error;
  }
};

export const createServiceRequest = async (requestData) => {
  try {
    const response = await api.post("/service-requests", requestData);
    return response.data;
  } catch (error) {
    console.error("Error creating service request:", error);
    throw error;
  }
};

export const updateServiceRequestStatus = async (requestId, statusData) => {
  try {
    const response = await api.patch(
      `/service-requests/${requestId}/status`,
      statusData,
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating service request ${requestId}:`, error);
    throw error;
  }
};

// Citizens
export const fetchCitizens = async (params = {}) => {
  try {
    const response = await api.get("/citizens", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching citizens:", error);
    throw error;
  }
};

export const createCitizen = async (citizenData) => {
  try {
    const response = await api.post("/citizens", citizenData);
    return response.data;
  } catch (error) {
    console.error("Error creating citizen:", error);
    throw error;
  }
};

export default {
  fetchZones,
  fetchZoneUtilityMetrics,
  fetchServiceRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  fetchCitizens,
  createCitizen,
};
