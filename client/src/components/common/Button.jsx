import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#6366F1] text-white hover:bg-[#4f46e5]",
    secondary:
      "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
    outline:
      "border border-[#6366F1] text-[#6366F1] hover:bg-[rgba(99,102,241,0.1)]",
    success: "bg-[#10B981] text-white hover:bg-[#059669]",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
