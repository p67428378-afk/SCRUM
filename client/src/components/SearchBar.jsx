import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex font-normal gap-[8px] items-center leading-[normal] not-italic overflow-clip p-[12px] relative rounded-[10px] shrink-0 text-[#707a8c] text-[14px] w-full">
      <span className="relative shrink-0 text-lg">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search recipes by title, description, or ingredients..."
        className="bg-transparent border-none outline-none w-full text-[#171c29] placeholder-[#707a8c]"
      />
    </div>
  );
}
