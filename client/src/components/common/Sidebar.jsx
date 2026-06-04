
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-[64px] w-sidebar-width h-[calc(100vh-64px)] z-40 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flex flex-col pt-stack-lg">
      <div className="px-6 mb-8">
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed-dim">Community Portal</h2>
        <p className="text-label-sm text-outline font-label-sm">Management Office</p>
      </div>
      <nav className="flex-1">
        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-stack-md py-3 px-6 transition-all cursor-pointer ${isActive ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary border-l-4 border-primary dark:border-primary-fixed-dim' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-label-md text-label-md">Dashboard</span>
        </NavLink>
        <NavLink to="/announcements" className={({ isActive }) => `flex items-center gap-stack-md py-3 px-6 transition-all cursor-pointer ${isActive ? 'bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary border-l-4 border-primary dark:border-primary-fixed-dim' : 'text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant'}`}>
          <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
          <span className="font-label-md text-label-md">Announcements</span>
        </NavLink>
        {/* Add other NavLink items here */}
      </nav>
      <div className="p-6">
        <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined" data-icon="add">add</span>
          Create Notice
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
