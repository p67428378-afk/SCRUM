import React from "react";
import { LayoutGrid, Map, Split } from "lucide-react";

export default function FilterToggles({
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}) {
  const filterOptions = [
    { id: "all", label: "All Regions" },
    { id: "state", label: "States Only (28)" },
    { id: "union_territory", label: "Union Territories (8)" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Category Toggles */}
      <div className="flex items-center bg-[#E3E8F0] p-1 rounded-xl gap-1">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFilterChange(opt.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition ${
              activeFilter === opt.id
                ? "bg-white text-[#2563EB] shadow-sm font-semibold"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* View Switcher */}
      {onViewModeChange && (
        <div className="flex items-center bg-[#E3E8F0] p-1 rounded-xl gap-1 self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "grid"
                ? "bg-white text-[#2563EB] shadow-sm font-semibold"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">Grid</span>
          </button>

          <button
            onClick={() => onViewModeChange("map")}
            title="Map View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "map"
                ? "bg-white text-[#2563EB] shadow-sm font-semibold"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="hidden md:inline">Map</span>
          </button>

          <button
            onClick={() => onViewModeChange("split")}
            title="Split View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === "split"
                ? "bg-white text-[#2563EB] shadow-sm font-semibold"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            <Split className="w-4 h-4" />
            <span className="hidden md:inline">Split</span>
          </button>
        </div>
      )}
    </div>
  );
}
