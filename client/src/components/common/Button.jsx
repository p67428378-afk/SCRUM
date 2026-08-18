import React from "react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#2663eb] text-white hover:bg-[#1d4ed8] focus:ring-[#2663eb]",
    secondary:
      "bg-[#e3e8f0] text-[#171c29] hover:bg-[#cbd5e1] focus:ring-[#707a8c]",
    outline:
      "border border-[#2663eb] text-[#2663eb] hover:bg-[#f7fafc] focus:ring-[#2663eb]",
    danger: "bg-[#db2626] text-white hover:bg-[#b91c1c] focus:ring-[#db2626]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
