import React from "react";

export default function StatCard({
  title,
  value,
  subtext,
  badgeText,
  badgeType,
  footerLabel,
  footerValue,
  icon,
  iconColor,
}) {
  return (
    <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-start">
        <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
          {title}
        </h3>
        {badgeText && (
          <div
            className={`px-2 py-0.5 rounded flex items-center gap-1 font-code text-xs ${
              badgeType === "success"
                ? "bg-primary/10 border border-primary text-primary"
                : "bg-secondary/10 border border-secondary text-secondary"
            }`}
          >
            {badgeType === "success" && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            )}
            {badgeText}
          </div>
        )}
        {!badgeText && icon && (
          <span className="material-symbols-outlined text-on-surface-variant">
            {icon}
          </span>
        )}
      </div>
      <div>
        <div className="font-headline-md text-lg font-semibold text-on-surface mb-1">
          {value}
        </div>
        <div className="font-code text-xs text-on-surface-variant flex items-center gap-2">
          {subtext}
        </div>
      </div>
      {(footerLabel || footerValue) && (
        <div className="mt-auto pt-2 border-t border-[#334155] flex justify-between items-center text-on-surface-variant font-label-md text-xs">
          <span>{footerLabel}</span>
          <span className="text-on-surface">{footerValue}</span>
        </div>
      )}
      {icon && (
        <div className="absolute -bottom-4 -right-4 text-[#334155] opacity-20 pointer-events-none">
          <span
            className="material-symbols-outlined text-8xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
      )}
    </div>
  );
}
