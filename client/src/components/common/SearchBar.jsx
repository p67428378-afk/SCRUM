import React from "react";
import { Search } from "lucide-react";

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search by title, author, or ISBN...",
  onSubmit,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>
    </form>
  );
};

export default SearchBar;
