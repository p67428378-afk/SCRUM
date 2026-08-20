import React from "react";
import { PieChart, BarChart2, Layers } from "lucide-react";

export default function ZonalDistributionChart({ regions }) {
  // Group regions by geographical zone
  const zones = regions.reduce((acc, r) => {
    const z = r.region || "Unassigned";
    if (!acc[z]) {
      acc[z] = { name: z, total: 0, states: 0, uts: 0, population: 0 };
    }
    acc[z].total += 1;
    if (r.type === "state") acc[z].states += 1;
    else acc[z].uts += 1;
    acc[z].population += r.population || 0;
    return acc;
  }, {});

  const zoneList = Object.values(zones).sort((a, b) => b.total - a.total);
  const totalCount = regions.length || 1;

  const ZONE_BAR_COLORS = {
    "Northern India": "bg-[#2563EB]",
    "Southern India": "bg-[#059669]",
    "Western India": "bg-[#D97706]",
    "Eastern India": "bg-[#7C3AED]",
    "Central India": "bg-[#EC4899]",
    "North-Eastern India": "bg-[#0891B2]",
    "Island UTs": "bg-[#475569]",
  };

  return (
    <div className="bg-white border border-[#E3E8F0] p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[#0F172A] text-lg flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2563EB]" />
            <span>Zonal Council Distribution</span>
          </h3>
          <p className="text-xs text-[#707A8C] mt-0.5">
            Regional breakdown of 28 States and 8 Union Territories across Zonal
            Councils
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {zoneList.map((zone) => {
          const percentage = Math.round((zone.total / totalCount) * 100);
          const barColor = ZONE_BAR_COLORS[zone.name] || "bg-[#2563EB]";

          return (
            <div key={zone.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0F172A]">
                    {zone.name}
                  </span>
                  <span className="text-[#707A8C]">
                    ({zone.states} {zone.states === 1 ? "State" : "States"} |{" "}
                    {zone.uts} {zone.uts === 1 ? "UT" : "UTs"})
                  </span>
                </div>
                <span className="font-bold text-[#2563EB]">
                  {zone.total} {zone.total === 1 ? "Region" : "Regions"} (
                  {percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E3E8F0] flex">
                <div
                  className={`h-full ${barColor} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
