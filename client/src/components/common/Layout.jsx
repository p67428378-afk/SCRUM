
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="bg-surface text-on-surface">
      <Header />
      <Sidebar />
      <main className="ml-sidebar-width pt-header-height min-h-screen bg-background">
        <div className="p-margin-desktop max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
