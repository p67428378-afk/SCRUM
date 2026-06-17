import React from 'react';
import PropTypes from 'prop-types';

export const EmployeeTable = ({
  users = [],
  onEdit,
  onDeactivate,
  onActivate,
  onAssignRoles,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f1f3f5] border-b border-[#dee2e6]">
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Employee ID</th>
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Roles</th>
            <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#dee2e6]">
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-on-surface-variant">
                No employees found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-[#f8f9fa] transition-colors group">
                <td className="px-6 py-4 text-body-md font-medium text-primary">{user.employee_id}</td>
                <td className="px-6 py-4 text-body-md font-bold">{`${user.first_name} ${user.last_name}`}</td>
                <td className="px-6 py-4 text-body-md text-on-surface-variant">{user.email}</td>
                <td className="px-6 py-4">
                  {user.status === 'ACTIVE' || user.status === 'Active' ? (
                    <span className="bg-[#e7f5ea] text-[#1e7e34] px-3 py-1 rounded-full text-label-md font-bold">Active</span>
                  ) : (
                    <span className="bg-[#f8f9fa] text-outline px-3 py-1 rounded-full text-label-md font-bold border border-outline-variant">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-body-md">
                    {user.roles && user.roles.length > 0
                      ? user.roles.map(r => typeof r === 'string' ? r : r.name).join(', ')
                      : 'No Roles'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onAssignRoles(user)}
                      className="p-2 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors"
                      title="Assign Roles"
                    >
                      <span className="material-symbols-outlined">manage_accounts</span>
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-primary hover:bg-primary-container/10 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    {user.status === 'ACTIVE' || user.status === 'Active' ? (
                      <button
                        onClick={() => onDeactivate(user.id)}
                        className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors"
                        title="Deactivate User"
                      >
                        <span className="material-symbols-outlined">person_off</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(user)}
                        className="p-2 text-secondary hover:bg-secondary-container/20 rounded-lg transition-colors"
                        title="Activate User"
                      >
                        <span className="material-symbols-outlined">person_check</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

EmployeeTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      employee_id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      roles: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
      ]),
    })
  ),
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
  onAssignRoles: PropTypes.func.isRequired,
};

export default EmployeeTable;
