import React from 'react';
import PropTypes from 'prop-types';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'users', label: 'Users', icon: 'group' },
    { id: 'roles', label: 'Roles', icon: 'badge' },
    { id: 'permissions', label: 'Permissions', icon: 'security' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'history' },
  ];

  return (
    <aside className="w-[240px] bg-tertiary flex-shrink-0 flex flex-col py-gutter border-r border-outline-variant">
      <div className="px-6 mb-8">
        <h2 className="text-white font-headline-sm">Admin Panel</h2>
        <p class="text-white/60 text-label-md">Enterprise Control</p>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-all ${
                  activeTab === item.id
                    ? 'sidebar-active text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-label-md">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-4 py-6 border-t border-white/10">
        <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg text-label-md font-bold transition-all flex items-center justify-center gap-2 mb-4">
          <span className="material-symbols-outlined">help</span>
          Support
        </button>
        <div className="flex items-center gap-3 px-2 text-white/70 hover:text-white cursor-pointer transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md">Settings</span>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default Sidebar;
