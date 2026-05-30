import React from 'react';

const Header = () => {
  return (
    <header className='fixed top-0 right-0 h-16 ml-[260px] px-lg w-[calc(100%-260px)] bg-surface border-b border-outline-variant flex justify-between items-center z-40'>
      <h2 className='text-headline-md font-headline-md font-bold text-on-surface'>Library Management System</h2>
      <div className='flex items-center gap-lg'>
        <button className='text-on-surface-variant hover:text-primary transition-colors duration-200 active:scale-95'>
          <span className='material-symbols-outlined' data-icon='notifications'>notifications</span>
        </button>
        <button className='text-on-surface-variant hover:text-primary transition-colors duration-200 active:scale-95'>
          <span className='material-symbols-outlined' data-icon='settings'>settings</span>
        </button>
        <div className='h-8 w-[1px] bg-outline-variant'></div>
        <img alt='User Avatar' className='w-8 h-8 rounded-full border border-outline-variant' src='https://lh3.googleusercontent.com/aida-public/AB6AXuCM5UtjIkoj6BOzNmKIlv2kzN21Zxhnjmb3hkNMzTNVh9x5riPCOJk8kKxZVu_45cRJ2fs0xktNhbmha0uNK9rTC_kc6ezSEL2tyMXx1PZGVJ78F4A59Lp0AqGDkUTkw6JJH_29Nhhw6bMaLo6w_Wwa4r2f5e_zX-9nukmLN95vkJHNMqckxtEEphwVNtuO_adorSEiVJ-97V7tDsyS35aB411IruPta8LMOxi0oRQa4eFIGGxSXMJ0pb3vVbM4cip46Jq3ClkPeoMx' />
      </div>
    </header>
  );
};

export default Header;
