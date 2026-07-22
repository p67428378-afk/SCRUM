import React from "react";

export default function Badge({ priority }) {
  const styles = {
    High: "bg-error-container/30 text-on-error-container border border-error/20",
    Medium:
      "bg-tertiary-fixed/40 text-on-tertiary-fixed border border-tertiary/20",
    Low: "bg-surface-container-high text-on-surface border border-outline-variant/30",
  };

  const currentStyle = styles[priority] || styles.Medium;

  return (
    <span
      className={`px-3 py-1 rounded-full font-label-sm text-[10px] uppercase tracking-wider font-bold ${currentStyle}`}
    >
      {priority} Priority
    </span>
  );
}
