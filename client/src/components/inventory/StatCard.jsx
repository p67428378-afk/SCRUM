import React from "react";
import Badge from "../common/Badge";

export default function StatCard({
  title,
  value,
  badgeText,
  badgeVariant = "success",
}) {
  return (
    <div className="bg-white border border-[#e3e8f0] flex flex-1 flex-col gap-[4px] p-[16px] rounded-[14px] shadow-sm">
      <p className="text-[#707a8c] text-[12px] font-medium">{title}</p>
      <div className="flex gap-[8px] items-baseline">
        <p className="font-bold text-[#171c29] text-[24px]">{value}</p>
        {badgeText && <Badge variant={badgeVariant}>{badgeText}</Badge>}
      </div>
    </div>
  );
}
