import React from "react";

export default function TelemetryStatCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color = "primary",
  subtitle,
}) {
  const colorMap = {
    primary: "text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/30",
    secondary: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30",
    warning: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
    error: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
    accent: "text-[#4CDEFF] bg-[#4CDEFF]/10 border-[#4CDEFF]/30",
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-4 shadow-lg relative overflow-hidden transition hover:border-[#00D1FF]/50 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#BBC9CF] mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-1.5 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#DAE2FD]">
              {value !== undefined && value !== null ? value : "--"}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#BBC9CF] font-mono">
              {unit}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-[#BBC9CF] mt-2 flex items-center gap-1 font-mono truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-xs text-[#10B981] mt-2 font-mono flex items-center gap-1 truncate">
              <span>↑</span> {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-[#3C494E]/50 flex justify-between items-center text-[10px] text-[#BBC9CF] font-mono gap-1">
        <span className="whitespace-nowrap shrink-0">UPDATED REAL-TIME</span>
        <span className="text-emerald-400 font-semibold whitespace-nowrap shrink-0">
          • SENSOR ACTIVE
        </span>
      </div>
    </div>
  );
}
