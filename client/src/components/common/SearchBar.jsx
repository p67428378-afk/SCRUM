import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0F172A] border border-slate-border text-on-surface rounded-lg py-2 pl-10 pr-3 focus:ring-1 focus:ring-brand-indigo focus:border-brand-indigo font-body-md text-body-md"
        placeholder={placeholder}
      />
    </div>
  );
}
