import React from "react";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "rounded-lg py-2 px-4 font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-indigo-btn text-white hover:bg-indigo-btn/90",
    secondary:
      "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80",
    outline: "btn-outline",
    danger:
      "bg-error-container text-on-error-container hover:bg-error-container/90",
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
