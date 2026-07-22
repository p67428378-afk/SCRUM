import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  icon = null,
}) {
  const baseStyles =
    "py-2 px-4 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-on-primary hover:bg-primary-container focus:ring-primary",
    secondary:
      "bg-secondary text-on-secondary hover:bg-secondary-container focus:ring-secondary",
    outline:
      "border border-outline text-on-surface hover:bg-surface-container focus:ring-primary",
    danger: "bg-error text-on-error hover:bg-error-container focus:ring-error",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
    </button>
  );
}
