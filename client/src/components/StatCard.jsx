import React from "react";

export default function StatCard({
  label,
  value,
  subtext,
  valueColor = "text-white",
}) {
  return (
    <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700/50">
      <p className="text-xs text-slate-400 uppercase font-mono mb-1">{label}</p>
      <p
        className={`text-xl md:text-2xl font-bold font-mono ${valueColor} truncate`}
      >
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-slate-400 font-mono mt-1">{subtext}</p>
      )}
    </div>
  );
}
