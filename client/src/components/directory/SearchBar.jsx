import React from "react";
import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[240px]">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#707A8C]">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search state, union territory, or capital city..."
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E3E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#707A8C] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#707A8C] hover:text-[#0F172A]"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
