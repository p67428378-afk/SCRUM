import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className='bg-background font-body-md text-on-surface'>
      <Sidebar />
      <Header />
      <main className='ml-[260px] mt-16 p-xl min-h-screen'>
        <div className='max-w-container-max mx-auto space-y-xl'>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
