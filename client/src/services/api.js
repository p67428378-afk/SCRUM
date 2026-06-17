import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createUser = async (userData) => {
  const response = await api.post('/api/v1/admin/users', userData);
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await api.get(`/api/v1/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/api/v1/admin/users/${userId}`, userData);
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await api.delete(`/api/v1/admin/users/${userId}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get('/api/v1/admin/roles');
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post('/api/v1/admin/roles', roleData);
  return response.data;
};

export const assignUserRoles = async (userId, roleIds) => {
  const response = await api.put(`/api/v1/admin/users/${userId}/roles`, { role_ids: roleIds });
  return response.data;
};

export const getPermissions = async () => {
  const response = await api.get('/api/v1/admin/permissions');
  return response.data;
};

export const updateUserPermissions = async (userId, permissionIds) => {
  const response = await api.patch(`/api/v1/admin/users/${userId}/permissions`, { permission_ids: permissionIds });
  return response.data;
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  const response = await api.patch(`/api/v1/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds });
  return response.data;
};

export const getDashboardUsers = async (params = {}) => {
  const response = await api.get('/api/v1/admin/dashboard/users', { params });
  return response.data;
};

export const getDashboardRoles = async (params = {}) => {
  const response = await api.get('/api/v1/admin/dashboard/roles', { params });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/api/v1/admin/dashboard/audit-logs', { params });
  return response.data;
};

export default api;
