import React from 'react';

export default function Sidebar({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'onboarding', label: 'Onboarding Wizard', icon: 'assignment_ind' },
  ];

  return (
    <nav className="hidden md:flex bg-slate-800 text-slate-200 fixed left-0 top-0 h-full w-[280px] border-r border-slate-700 flex-col py-lg px-md z-20 shadow-none">
      <div className="mb-xl flex items-center gap-sm">
        <span className="material-symbols-outlined text-indigo-500 icon-fill text-[32px]">account_balance</span>
        <div>
          <h1 className="text-xl font-bold text-slate-200 leading-tight">ApexBank</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Onboarding Admin</p>
        </div>
      </div>
      
      <ul className="flex flex-col gap-sm flex-grow">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-md px-md py-sm rounded-lg hover:bg-slate-700 transition-colors text-left cursor-pointer active:scale-95 transition-transform ${
                  isActive
                    ? 'text-indigo-500 font-bold border-r-2 border-indigo-500 bg-slate-800/50'
                    : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-auto border-t border-slate-700 pt-md">
        <div className="flex items-center gap-md px-md py-sm rounded-lg text-slate-400">
          <span className="material-symbols-outlined">account_circle</span>
          <span>Aarchi Jain</span>
        </div>
      </div>
    </nav>
  );
}