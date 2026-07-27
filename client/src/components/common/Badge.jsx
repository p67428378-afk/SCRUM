import React from "react";

export default function Badge({ children, variant = "info" }) {
  const baseStyles =
    "px-2 py-1 rounded text-xs font-semibold inline-flex items-center";

  const variants = {
    success: "bg-brand-emerald/10 text-emerald",
    error: "bg-error-container/20 text-error",
    warning: "bg-yellow-500/10 text-yellow-500",
    info: "bg-brand-indigo/10 text-brand-indigo",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]}`}>{children}</span>
  );
}
