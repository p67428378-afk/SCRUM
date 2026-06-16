import React from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div class="relative w-full sm:w-64">
      <span class="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-slate-400 text-[18px]">search</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        class="w-full bg-slate-900 border border-slate-700 rounded-lg pl-xl pr-md py-[6px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 font-body-sm text-body-sm placeholder-slate-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}