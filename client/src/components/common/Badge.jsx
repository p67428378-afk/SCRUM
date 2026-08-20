import React from "react";

export default function Badge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let colorClasses = "bg-gray-100 text-gray-800 border-gray-200";

  if (["active", "performing", "high"].includes(normalized)) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (["pending", "watchlist", "moderate"].includes(normalized)) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (
    ["inactive", "underperforming", "critical", "high risk"].includes(
      normalized,
    )
  ) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      {status}
    </span>
  );
}
