import React from "react";

export const Badge = ({ children, variant = "info", className = "" }) => {
  const baseStyles =
    "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1";

  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    neutral: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
