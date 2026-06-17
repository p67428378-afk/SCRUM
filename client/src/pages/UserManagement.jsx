import React, { useEffect, useState } from 'react';
import {
  getDashboardUsers,
  createUser,
  updateUser,
  deactivateUser,
  getRoles,
  assignUserRoles,
} from '../services/api';
import EmployeeTable from '../components/dashboard/EmployeeTable';
import Button from '../components/common/Button';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    status: 'ACTIVE',
  });
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (roleFilter) params.role = roleFilter;

      const data = await getDashboardUsers(params);
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      status: 'ACTIVE',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      employee_id: user.employee_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      status: user.status,
    });
    setIsUserModalOpen(true);
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    const userRoleIds = user.roles
      ? user.roles.map((r) => (typeof r === 'string' ? roles.find((role) => role.name === r)?.id : r.id)).filter(Boolean)
      : [];
    setSelectedRoleIds(userRoleIds);
    setIsRoleModalOpen(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.detail || 'Failed to save user.');
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignUserRoles(selectedUser.id, selectedRoleIds);
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error assigning roles:', err);
      setError('Failed to assign roles.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deactivateUser(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error deactivating user:', err);
        setError('Failed to deactivate user.');
      }
    }
  };

  const handleActivate = async (user) => {
    try {
      await updateUser(user.id, { ...user, status: 'ACTIVE' });
      fetchUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      setError('Failed to activate user.');
    }
  };

  const handleRoleCheckboxChange = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="font-label-md uppercase tracking-wider">Administration</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-md text-primary font-bold">User Management</span>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg text-body-md flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">X</button>
        </div>
      )}

      <section className="bg-white rounded-xl card-shadow border border-[#dee2e6] overflow-hidden">
        <div className="p-gutter border-b border-[#dee2e6] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-headline-md font-headline-md text-on-surface">Employee Accounts</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg w-[240px] focus:ring-2 focus:ring-primary focus:border-primary text-body-md"
                placeholder="Search employees..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              className="px-4 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>

            <Button onClick={handleOpenAddModal} variant="secondary" icon="add">
              Add New User
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading employees...</div>
        ) : (
          <EmployeeTable
            users={users}
            onEdit={handleOpenEditModal}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
            onAssignRoles={handleOpenRoleModal}
          />
        )}
      </section>

      {/* User Add/Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 card-shadow">
            <h3 className="text-headline-sm font-bold">
              {selectedUser ? 'Edit Employee Account' : 'Provision New Employee Account'}
            </h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              {!selectedUser && (
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1">Status</label>
                <select
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg text-body-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setIsUserModalOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 card-shadow">
            <h3 className="text-headline-sm font-bold">Assign Functional Roles</h3>
            <p className="text-body-md text-on-surface-variant">
              Assign roles to {selectedUser?.first_name} {selectedUser?.last_name}
            </p>
            <form onSubmit={handleRoleSubmit} className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => handleRoleCheckboxChange(role.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="text-body-md font-bold">{role.name}</p>
                      <p className="text-label-md text-on-surface-variant">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button onClick={() => setIsRoleModalOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Roles
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
