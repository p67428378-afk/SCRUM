import React from "react";

export default function Header() {
  return (
    <header className="h-16 flex justify-between items-center px-xl w-full bg-surface-dim border-b border-outline-variant z-40 shrink-0">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-sm text-body-sm text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            placeholder="Search accounts..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-md">
        <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors opacity-80 active:opacity-100 rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors opacity-80 active:opacity-100 rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <img
          alt="User profile picture"
          className="w-8 h-8 rounded-full border border-outline-variant object-cover ml-sm"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXTA3IvB8RICvlnD-CEgAw53VGgx5cHIO1S5cUIInmJ2CE6abHnoElXoEhgmqCsX-0PNakDqfVjHmAnRyK8AqoyaWYelUPAKBmvdE_atQoDQM8cn32G-4mcyghVCEYJnfxP2u5gpq-QaFsH6k1pfV6rf5z-ULy25LG73JR9o_zmoeYUcp1sWxOrkDX9Et5ZV0bqIOvn0ZV5T_zMD8LWub-fd4kBOt_oldcErS7-iQ1t7zOHITysG1Jw393ipy8vF_PZ-W93y3iNjM"
        />
      </div>
    </header>
  );
}
