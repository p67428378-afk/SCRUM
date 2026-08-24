import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="bg-[#f2f5fa] border border-[#e3e8f0] flex items-center gap-[8px] p-[12px] rounded-[10px] text-[#707a8c] text-[14px] w-full">
      <Search size={18} className="shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none w-full text-[#171c29] placeholder-[#707a8c]"
      />
    </div>
  );
}
