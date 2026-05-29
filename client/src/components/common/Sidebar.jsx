
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', icon: 'directions_car', label: 'Browse Cars' },
    { path: '/bookings', icon: 'calendar_today', label: 'My Rentals' },
    { path: '/chat', icon: 'chat', label: 'Messages' },
    { path: '/profile', icon: 'settings', label: 'Account Settings' },
  ];

  return (
    <aside className='fixed left-0 top-[64px] w-[240px] h-[calc(100vh-64px)] bg-surface-container-low border-r border-outline-variant flex flex-col py-md px-sm gap-xs'>
      <div className='px-md py-sm mb-sm'>
        <p className='font-label-md text-label-md text-on-surface-variant opacity-70 uppercase tracking-widest text-[10px]'>Main Menu</p>
      </div>
      <nav className='flex flex-col gap-xs flex-grow'>
        {navLinks.map(link => (
          <Link 
            key={link.path}
            to={link.path} 
            className={`flex items-center gap-md px-md py-sm rounded-lg font-bold transition-opacity active:opacity-80 ${
              location.pathname === link.path 
              ? 'bg-secondary-container text-on-secondary-container' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}>
            <span className='material-symbols-outlined'>{link.icon}</span>
            <span className='font-label-md text-label-md'>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className='mt-auto flex flex-col gap-xs border-t border-outline-variant pt-md'>
        <Link to='/help' className='flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all'>
          <span className='material-symbols-outlined'>help</span>
          <span className='font-label-md text-label-md'>Help Center</span>
        </Link>
        <Link to='/logout' className='flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all'>
          <span className='material-symbols-outlined'>logout</span>
          <span className='font-label-md text-label-md'>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
