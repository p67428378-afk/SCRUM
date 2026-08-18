import React from "react";

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-[#F5F2EB] text-[#80756B] border-[#E5DED1]",
    success: "bg-emerald-50 text-[#1F9E4D] border-emerald-200",
    warning: "bg-amber-50 text-[#EB9414] border-amber-200",
    error: "bg-red-50 text-[#D92D2D] border-red-200",
    primary: "bg-orange-50 text-[#D96B1F] border-orange-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
}
