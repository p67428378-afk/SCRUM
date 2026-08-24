import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "px-[16px] py-[12px] rounded-[10px] font-medium text-[14px] transition-all flex items-center justify-center gap-[8px]";
  const variants = {
    primary: "bg-[#2663eb] text-white hover:bg-[#1d4ed8] disabled:bg-blue-300",
    secondary:
      "bg-white border border-[#e3e8f0] text-[#171c29] hover:bg-gray-50 disabled:bg-gray-100",
    danger: "bg-[#db2626] text-white hover:bg-[#b91c1c] disabled:bg-red-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
