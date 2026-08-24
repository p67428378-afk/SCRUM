import React from "react";

export default function Badge({
  children,
  variant = "success",
  className = "",
}) {
  const baseStyles =
    "px-[8px] py-[4px] rounded-[999px] text-[12px] font-medium inline-flex items-center justify-center";
  const variants = {
    success: "bg-[#17a34a] text-white",
    warning: "bg-[#eb9917] text-white",
    danger: "bg-[#db2626] text-white",
    info: "bg-[#2663eb] text-white",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
