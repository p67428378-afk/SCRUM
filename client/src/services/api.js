import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
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

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user || {}));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const searchPatients = async (params = {}) => {
  const { query, skip = 0, limit = 20, gender } = params;
  const response = await api.get("/patients/search", {
    params: {
      ...(query ? { query } : {}),
      skip,
      limit,
      ...(gender ? { gender } : {}),
    },
  });
  return response.data;
};

export const getPatient = async (id) => {
  const response = await api.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData, overrideDuplicate = false) => {
  const response = await api.post("/patients", patientData, {
    params: { override_duplicate: overrideDuplicate },
  });
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/patients/${id}`, patientData);
  return response.data;
};

export const getMedicalHistory = async (id) => {
  const response = await api.get(`/patients/${id}/medical-history`);
  return response.data;
};

export const updateMedicalHistory = async (id, medicalData) => {
  const response = await api.put(
    `/patients/${id}/medical-history`,
    medicalData,
  );
  return response.data;
};

export default api;
