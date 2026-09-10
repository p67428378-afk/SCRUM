import React from "react";

export default function StatusBadge({ status, label }) {
  const normStatus = String(status || label || "").toLowerCase();

  let variant = "slate";
  if (
    ["healthy", "optimal", "active", "operational", "resolved"].some((s) =>
      normStatus.includes(s),
    )
  ) {
    variant = "emerald";
  } else if (
    ["warning", "maintenance due", "quarantine", "low stock"].some((s) =>
      normStatus.includes(s),
    )
  ) {
    variant = "amber";
  } else if (
    ["critical", "in repair", "decommissioned", "out of stock"].some((s) =>
      normStatus.includes(s),
    )
  ) {
    variant = "rose";
  } else if (["idle", "fallow", "info"].some((s) => normStatus.includes(s))) {
    variant = "sky";
  }

  const styles = {
    emerald:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dot-emerald-500",
    amber: "bg-amber-50 text-amber-800 border-amber-200 dot-amber-500",
    rose: "bg-rose-50 text-rose-800 border-rose-200 dot-rose-500",
    sky: "bg-sky-50 text-sky-800 border-sky-200 dot-sky-500",
    slate: "bg-slate-100 text-slate-700 border-slate-200 dot-slate-400",
  };

  const dotColors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    slate: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      <span>{label || status}</span>
    </span>
  );
}
