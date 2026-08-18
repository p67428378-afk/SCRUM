import React from "react";

export default function Badge({ children, variant = "info", className = "" }) {
  const variants = {
    info: "bg-[#e0e7ff] text-[#2663eb]",
    success: "bg-[#dcfce7] text-[#17a34a]",
    warning: "bg-[#fef3c7] text-[#eb9917]",
    danger: "bg-[#fee2e2] text-[#db2626]",
    neutral: "bg-[#f1f5f9] text-[#707a8c]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
