import React from "react";

export default function ProgressBar({ value, max }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  let barColor = "bg-primary";
  if (percentage >= 100) {
    barColor = "bg-error";
  } else if (percentage >= 80) {
    barColor = "bg-tertiary-container";
  }

  return (
    <div>
      <div className="flex justify-between font-code-md text-code-md text-on-surface-variant mb-2">
        <span>{value.toLocaleString()} INR Spent</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-surface-dim rounded-full h-1.5 overflow-hidden border border-outline-variant/50">
        <div
          className={`${barColor} h-1.5 rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
