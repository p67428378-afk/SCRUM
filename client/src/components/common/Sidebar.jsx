import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-md px-lg py-md text-primary bg-primary-container border-l-4 border-primary transition-all duration-150 opacity-90'
      : 'flex items-center gap-md px-lg py-md text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200';

  return (
    <aside className='fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col h-full py-lg z-50'>
      <div className='px-lg mb-xl'>
        <h1 className='text-headline-md font-headline-md font-bold text-primary'>Admin Portal</h1>
        <p className='text-label-md font-label-md text-on-surface-variant'>Central Library</p>
      </div>
      <nav className='flex-1 space-y-xs'>
        <NavLink to='/dashboard' className={navLinkClass}>
          <span className='material-symbols-outlined' data-icon='dashboard'>dashboard</span>
          <span className='text-label-md font-label-md'>Dashboard</span>
        </NavLink>
        <NavLink to='/books' className={navLinkClass}>
          <span className='material-symbols-outlined' data-icon='book'>book</span>
          <span className='text-label-md font-label-md'>Books</span>
        </NavLink>
        <NavLink to='/patrons' className={navLinkClass}>
          <span className='material-symbols-outlined' data-icon='group'>group</span>
          <span className='text-label-md font-label-md'>Patrons</span>
        </NavLink>
        <NavLink to='/loans' className={navLinkClass}>
          <span className='material-symbols-outlined' data-icon='handshake'>handshake</span>
          <span className='text-label-md font-label-md'>Loans</span>
        </NavLink>
        <NavLink to='/search' className={navLinkClass}>
          <span className='material-symbols-outlined' data-icon='search'>search</span>
          <span className='text-label-md font-label-md'>Search</span>
        </NavLink>
      </nav>
      <div className='px-lg mt-auto pt-lg border-t border-outline-variant'>
        <div className='flex items-center gap-md'>
          <img alt='Library Administrator Profile' className='w-10 h-10 rounded-full object-cover' src='https://lh3.googleusercontent.com/aida-public/AB6AXuAilnDoszZFBxIdGB9tiH9FFGeaeYIA4_V6-gqnROO7ozovhv5m7BeiHjHhziflBHE9lZOXrZQwkgbsBtp1Y74TLL59tt2A96wUk5VjC6N-VaVv_ZC8RqjmXKMUWCvi-TA_FRURaDcevjFL1__jAja00hFRcGAu-uiCHxwacJe_cq6n3CwQWzcZE4NO7MNM2qYPr55y91cM18rGJqMZJvkNFoTQ6UYsTRh4pV1HzjD6zTWRAdTFX2Q75tdMPWCgrLBVHF7B1MDD5ZGi' />
          <div>
            <p className='text-label-md font-label-md font-bold'>Admin User</p>
            <p className='text-label-sm font-label-sm text-on-surface-variant'>System Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
