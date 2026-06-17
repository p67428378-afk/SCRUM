import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getAuditLogs, getDashboardUsers } from '../services/api';

export const AdminDashboard = ({ onNavigate }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [logsData, usersData] = await Promise.all([
          getAuditLogs({ limit: 5 }),
          getDashboardUsers({ limit: 1 }),
        ]);
        setAuditLogs(logsData.logs || []);
        setUserCount(usersData.total || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="font-label-md uppercase tracking-wider">Administration</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-md text-primary font-bold">Accounts Overview</span>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-4 rounded-lg text-body-md">
          {error}
        </div>
      )}

      {/* Informational Widgets Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[32px]">shield</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase">Security Status</p>
            <p className="text-headline-sm font-bold">High</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[32px]">verified_user</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase">Active Users</p>
            <p className="text-headline-sm font-bold">{loading ? '...' : userCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#dee2e6] card-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[32px]">manage_accounts</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase">Pending Approvals</p>
            <p className="text-headline-sm font-bold">12</p>
          </div>
        </div>
      </div>

      {/* Section 2: Recent Audit Logs */}
      <section className="bg-white rounded-xl card-shadow border border-[#dee2e6] overflow-hidden">
        <div className="p-gutter border-b border-[#dee2e6]">
          <h2 className="text-headline-md font-headline-md text-on-surface">Recent Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#f1f3f5] border-b border-[#dee2e6]">
                <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Action Type</th>
                <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Actor ID</th>
                <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Target ID</th>
                <th className="px-6 py-4 font-bold text-label-md text-on-surface-variant uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee2e6]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 text-body-md font-mono text-on-surface-variant">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-label-md font-bold">
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md font-bold">{log.actor_id || 'System'}</td>
                    <td className="px-6 py-4 text-body-md font-medium text-primary">{log.target_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-body-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#f8f9fa] flex justify-center border-t border-[#dee2e6]">
          <button
            onClick={() => onNavigate('audit-logs')}
            className="text-primary hover:text-on-primary-fixed-variant font-bold text-label-md flex items-center gap-2 transition-colors"
          >
            View All Audit Logs
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};

AdminDashboard.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default AdminDashboard;
