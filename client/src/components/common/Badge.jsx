import React from "react";

export default function Badge({ status }) {
  const styles = {
    GROW: "bg-[#E6F4EA] text-[#1E8E3E]",
    MAINTAIN: "bg-[#E8F0FE] text-[#1A73E8]",
    SWAP: "bg-[#FEF7E0] text-[#E37400]",
    REDUCE: "bg-[#FCE8E6] text-[#D93025]",
  };

  const currentStyle =
    styles[status?.toUpperCase()] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-DEFAULT text-[11px] font-bold ${currentStyle}`}
    >
      {status?.toUpperCase()}
    </span>
  );
}
