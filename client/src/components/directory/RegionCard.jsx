import React from "react";
import {
  MapPin,
  Users,
  Languages,
  ChevronRight,
  Building2,
} from "lucide-react";

export default function RegionCard({ region, onSelect }) {
  const isState = region.type === "state";

  const formatPopulation = (num) => {
    if (!num) return "N/A";
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} Lakh`;
    }
    return num.toLocaleString();
  };

  return (
    <div
      onClick={() => onSelect(region)}
      className="bg-white border border-[#E3E8F0] rounded-2xl p-5 hover:border-[#2563EB] hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isState ? "bg-[#2563EB]" : "bg-[#D97706]"
        }`}
      />

      <div>
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-lg text-[#0F172A] group-hover:text-[#2563EB] transition">
              {region.name}
            </h3>
            <p className="text-xs text-[#707A8C] font-medium mt-0.5">
              {region.region || "India"}
            </p>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isState
                ? "bg-[#2563EB]/10 text-[#2563EB]"
                : "bg-[#D97706]/10 text-[#D97706]"
            }`}
          >
            {isState ? "State" : "Union Territory"}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 mt-4 text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="font-medium text-[#707A8C]">Capital:</span>
            <span className="font-semibold text-[#0F172A]">
              {region.capital}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#059669] shrink-0" />
            <span className="font-medium text-[#707A8C]">Population:</span>
            <span className="font-medium text-[#0F172A]">
              {formatPopulation(region.population)}
            </span>
          </div>

          {region.official_languages &&
            region.official_languages.length > 0 && (
              <div className="flex items-start gap-2">
                <Languages className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span className="font-medium text-[#707A8C]">Languages:</span>
                <span className="line-clamp-1 text-[#0F172A]">
                  {region.official_languages.join(", ")}
                </span>
              </div>
            )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-3 border-t border-[#F8FAFC] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
        <span>View Details</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
}
