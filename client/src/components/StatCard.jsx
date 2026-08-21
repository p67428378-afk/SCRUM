import React from "react";

export default function StatCard({
  title,
  value,
  badgeText,
  badgeColor = "bg-[#17a34a]",
}) {
  return (
    <div
      className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-1 items-start p-4 rounded-[14px] shadow-sm w-full"
      data-testid="stat-card"
    >
      <p className="text-[#7a7066] text-xs font-medium">{title}</p>
      <div className="flex gap-2 items-baseline">
        <p className="font-bold text-[#1f1712] text-24px text-2xl">{value}</p>
        {badgeText && (
          <div
            className={`${badgeColor} flex items-center justify-center px-2 py-1 rounded-full`}
          >
            <p className="text-[10px] text-white font-medium">{badgeText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
