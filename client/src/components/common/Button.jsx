import React from "react";
import PropTypes from "prop-types";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  icon = null,
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg font-label-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary hover:bg-on-primary-fixed-variant text-white",
    secondary: "bg-secondary hover:bg-on-secondary-container text-white",
    outline:
      "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low",
    error: "bg-error hover:bg-on-error-container text-white",
    ghost: "hover:bg-surface-container-low text-on-surface-variant",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "error",
    "ghost",
  ]),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
};

export default Button;
