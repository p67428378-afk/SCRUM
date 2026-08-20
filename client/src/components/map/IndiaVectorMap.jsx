import React, { useState } from "react";
import { MapPin, Info, Layers } from "lucide-react";

// Coordinates (SVG viewport space 0-600 width, 0-650 height) for states/UTs
const REGION_COORDINATES = {
  "Andhra Pradesh": { x: 270, y: 460, zone: "Southern" },
  "Arunachal Pradesh": { x: 530, y: 190, zone: "North-Eastern" },
  Assam: { x: 490, y: 230, zone: "North-Eastern" },
  Bihar: { x: 380, y: 260, zone: "Eastern" },
  Chhattisgarh: { x: 310, y: 340, zone: "Central" },
  Goa: { x: 175, y: 450, zone: "Western" },
  Gujarat: { x: 120, y: 310, zone: "Western" },
  Haryana: { x: 200, y: 170, zone: "Northern" },
  "Himachal Pradesh": { x: 220, y: 110, zone: "Northern" },
  Jharkhand: { x: 370, y: 310, zone: "Eastern" },
  Karnataka: { x: 200, y: 460, zone: "Southern" },
  Kerala: { x: 210, y: 560, zone: "Southern" },
  "Madhya Pradesh": { x: 240, y: 310, zone: "Central" },
  Maharashtra: { x: 210, y: 380, zone: "Western" },
  Manipur: { x: 510, y: 260, zone: "North-Eastern" },
  Meghalaya: { x: 470, y: 245, zone: "North-Eastern" },
  Mizoram: { x: 500, y: 285, zone: "North-Eastern" },
  Nagaland: { x: 525, y: 230, zone: "North-Eastern" },
  Odisha: { x: 360, y: 370, zone: "Eastern" },
  Punjab: { x: 190, y: 140, zone: "Northern" },
  Rajasthan: { x: 140, y: 230, zone: "Northern" },
  Sikkim: { x: 420, y: 205, zone: "North-Eastern" },
  "Tamil Nadu": { x: 240, y: 550, zone: "Southern" },
  Telangana: { x: 260, y: 410, zone: "Southern" },
  Tripura: { x: 480, y: 275, zone: "North-Eastern" },
  "Uttar Pradesh": { x: 270, y: 220, zone: "Northern" },
  Uttarakhand: { x: 240, y: 145, zone: "Northern" },
  "West Bengal": { x: 410, y: 320, zone: "Eastern" },
  "Andaman and Nicobar Islands": { x: 520, y: 530, zone: "Island UT" },
  Chandigarh: { x: 205, y: 155, zone: "Northern" },
  "Dadra and Nagar Haveli and Daman and Diu": {
    x: 140,
    y: 375,
    zone: "Western",
  },
  Delhi: { x: 215, y: 185, zone: "Northern" },
  "Jammu and Kashmir": { x: 180, y: 80, zone: "Northern" },
  Ladakh: { x: 220, y: 60, zone: "Northern" },
  Lakshadweep: { x: 140, y: 550, zone: "Island UT" },
  Puducherry: { x: 260, y: 520, zone: "Southern" },
};

const ZONE_COLORS = {
  Northern: "#2563EB",
  Southern: "#059669",
  Western: "#D97706",
  Eastern: "#7C3AED",
  Central: "#EC4899",
  "North-Eastern": "#0891B2",
  "Island UT": "#475569",
};

export default function IndiaVectorMap({
  regions,
  onSelectRegion,
  selectedRegion,
}) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Match region objects with coordinates
  const regionMap = regions.reduce((acc, r) => {
    acc[r.name] = r;
    return acc;
  }, {});

  return (
    <div className="bg-white border border-[#E3E8F0] rounded-2xl p-6 shadow-sm flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#2563EB]" />
          <h2 className="font-bold text-[#0F172A] text-base">
            Interactive Vector Map of India
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#707A8C]">
          <Layers className="w-4 h-4" />
          <span>36 Administrative Divisions</span>
        </div>
      </div>

      {/* Map Graphic Container */}
      <div className="relative w-full aspect-[4/4.2] max-h-[580px] bg-[#F8FAFC] rounded-xl border border-[#E3E8F0] overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 600 650"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Outline / Silhouette */}
          <path
            d="M 180,40 L 250,50 L 280,100 L 260,160 L 330,200 L 420,200 L 550,180 L 540,300 L 450,330 L 410,400 L 280,620 L 200,580 L 160,460 L 100,350 L 120,250 Z"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-50"
          />

          {/* Render Pin Nodes for Regions */}
          {Object.entries(REGION_COORDINATES).map(([name, coords]) => {
            const reg = regionMap[name];
            const isSelected = selectedRegion && selectedRegion.name === name;
            const isHovered = hoveredRegion && hoveredRegion.name === name;
            const isState = reg ? reg.type === "state" : true;
            const pinColor = ZONE_COLORS[coords.zone] || "#2563EB";

            return (
              <g
                key={name}
                className="cursor-pointer transition-all duration-200"
                onClick={() => reg && onSelectRegion(reg)}
                onMouseEnter={() =>
                  setHoveredRegion(
                    reg || { name, capital: "N/A", type: "state" },
                  )
                }
                onMouseLeave={() => setHoveredRegion(null)}
              >
                {/* Outer halo if hovered or selected */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isState ? 18 : 14}
                    fill={pinColor}
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Base Pin Circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 11 : isHovered ? 9 : isState ? 7 : 5}
                  fill={isSelected ? "#0F172A" : pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-md transition-all duration-200"
                />

                {/* State/UT Label */}
                <text
                  x={coords.x}
                  y={coords.y + (isState ? 18 : 14)}
                  textAnchor="middle"
                  className={`text-[9px] font-semibold pointer-events-none ${
                    isSelected ? "fill-[#2563EB] font-bold" : "fill-[#475569]"
                  }`}
                >
                  {name.length > 12 ? `${name.substring(0, 10)}..` : name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Detail Overlay Card */}
        {(hoveredRegion || selectedRegion) && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72 bg-white/95 backdrop-blur border border-[#E3E8F0] p-4 rounded-xl shadow-lg transition-all animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">
                  {(hoveredRegion || selectedRegion).type === "state"
                    ? "State"
                    : "Union Territory"}
                </span>
                <h4 className="font-bold text-[#0F172A] text-sm">
                  {(hoveredRegion || selectedRegion).name}
                </h4>
              </div>
              <button
                onClick={() => onSelectRegion(hoveredRegion || selectedRegion)}
                className="text-xs text-[#2563EB] font-semibold hover:underline"
              >
                Details &rarr;
              </button>
            </div>
            <div className="mt-2 text-xs text-[#475569] space-y-1">
              <p>
                <span className="font-medium text-[#707A8C]">Capital:</span>{" "}
                <span className="font-semibold text-[#0F172A]">
                  {(hoveredRegion || selectedRegion).capital}
                </span>
              </p>
              {(hoveredRegion || selectedRegion).region && (
                <p>
                  <span className="font-medium text-[#707A8C]">Zone:</span>{" "}
                  {(hoveredRegion || selectedRegion).region}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-[#F8FAFC] flex flex-wrap items-center gap-3 text-xs text-[#707A8C]">
        <span className="font-semibold text-[#0F172A]">Zonal Legend:</span>
        {Object.entries(ZONE_COLORS).map(([zone, color]) => (
          <div key={zone} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span>{zone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
