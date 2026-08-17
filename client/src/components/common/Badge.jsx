import React from "react";

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-[#2a2a3d] text-[#9ea3b8] border-[#34344d]",
    success: "bg-[#21c45c]/15 text-[#21c45c] border-[#21c45c]/30",
    warning: "bg-[#f5a826]/15 text-[#f5a826] border-[#f5a826]/30",
    error: "bg-[#db2626]/15 text-[#db2626] border-[#db2626]/30",
    purple: "bg-[#7a3bed]/15 text-[#a855f7] border-[#7a3bed]/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  );
}
