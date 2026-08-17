import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#7a3bed] text-white hover:bg-[#682bd6] active:bg-[#5821be] shadow-lg shadow-[#7a3bed]/25",
    secondary:
      "bg-[#2a2a3d] text-[#f5f5fa] hover:bg-[#34344d] border border-[#3d3d56]",
    success:
      "bg-[#21c45c] text-white hover:bg-[#1ca750] shadow-lg shadow-[#21c45c]/25",
    outline: "border-2 border-[#7a3bed] text-[#a855f7] hover:bg-[#7a3bed]/10",
    ghost: "text-[#9ea3b8] hover:text-white hover:bg-[#2d2d42]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
