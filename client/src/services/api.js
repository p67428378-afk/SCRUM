import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Patients API
export const getPatients = async (skip = 0, limit = 20) => {
  const response = await apiClient.get("/api/v1/patients", {
    params: { skip, limit },
  });
  return response.data;
};

export const searchPatients = async (q = "", skip = 0, limit = 20) => {
  const response = await apiClient.get("/api/v1/patients/search", {
    params: { q, skip, limit },
  });
  return response.data;
};

export const getPatient = async (id) => {
  const response = await apiClient.get(`/api/v1/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await apiClient.post("/api/v1/patients", patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await apiClient.put(`/api/v1/patients/${id}`, patientData);
  return response.data;
};

// Medical Records API
export const getPatientRecords = async (patientId) => {
  const response = await apiClient.get(`/api/v1/records/patient/${patientId}`);
  return response.data;
};

export const createMedicalRecord = async (recordData) => {
  const response = await apiClient.post("/api/v1/records", recordData);
  return response.data;
};

// Appointments API
export const getAppointments = async (params = {}) => {
  const response = await apiClient.get("/api/v1/appointments", { params });
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await apiClient.post(
    "/api/v1/appointments",
    appointmentData,
  );
  return response.data;
};

export const getAvailableSlots = async (doctorId, date) => {
  const response = await apiClient.get("/api/v1/appointments/available-slots", {
    params: { doctor_id: doctorId, date },
  });
  return response.data;
};

export const getAppointment = async (id) => {
  const response = await apiClient.get(`/api/v1/appointments/${id}`);
  return response.data;
};

export const updateAppointment = async (id, appointmentData) => {
  const response = await apiClient.put(
    `/api/v1/appointments/${id}`,
    appointmentData,
  );
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await apiClient.delete(`/api/v1/appointments/${id}`);
  return response.data;
};

// Doctors API
export const getDoctors = async () => {
  const response = await apiClient.get("/api/v1/doctors");
  return response.data;
};

export const createDoctor = async (doctorData) => {
  const response = await apiClient.post("/api/v1/doctors", doctorData);
  return response.data;
};
