
import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 w-full h-[64px] z-50 bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant dark:border-outline flex justify-between items-center px-margin-desktop h-header-height">
      <div className="flex items-center gap-stack-md">
        <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">ResidentLink</span>
        <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full ml-8 border border-outline-variant">
          <span className="material-symbols-outlined text-outline" data-icon="search">search</span>
          <input className="bg-transparent border-none focus:ring-0 text-label-md font-label-md w-64 px-2" placeholder="Search announcements..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-stack-md">
        <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant" data-icon="settings">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2">
          <img alt="User profile photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLNiqOh0UmHYBGo8LW6V2IJvUoFv6TxDSqztYYN9I4D673W5GO8dzgsR7tZBq4688viC-OrDBJl8ZNvNkkKegHrvLjGjXrQxqUOFd3jBifYP8e7AO8KMuDQAvgBKhZzdSOGu1R8j3XYJE-n7P6uPfU27SIRzv99MiZU5DEKUipWJ8SJR2kgD-nA_qjnNIIKrIR8kl_AJLzaQusVSB0RcGGn2dTRnoySDmbylJorWrtYec6mtzDrs4BphDP0mZGJ_kzhTOpyqoxoxI" />
        </div>
      </div>
    </header>
  );
};

export default Header;
