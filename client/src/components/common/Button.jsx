import React from "react";

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyle =
    "font-bold font-label-lg py-3 px-6 rounded-DEFAULT transition-colors shadow-sm active:translate-y-[1px] focus:outline-none";

  const variants = {
    primary:
      "bg-dg-yellow text-dg-blue hover:bg-[#FFE066] border-b-2 border-[#D9B300] active:border-b-0 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-none",
    secondary:
      "bg-white text-dg-blue border border-surface-variant hover:bg-surface-container-low disabled:bg-gray-100 disabled:text-gray-400",
    danger: "bg-error text-white hover:bg-red-700 disabled:bg-red-300",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
