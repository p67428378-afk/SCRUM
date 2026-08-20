import React, { useState } from "react";
import {
  X,
  Building2,
  Users,
  MapPin,
  Globe,
  Code,
  Layers,
  Shield,
  FileText,
} from "lucide-react";

export default function RegionDetailDrawer({ region, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!region) return null;

  const isState = region.type === "state";

  const formatPopulation = (num) => {
    if (!num) return "N/A";
    return num.toLocaleString() + ` (${(num / 10000000).toFixed(2)} Cr)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#E3E8F0] relative bg-gradient-to-r from-[#F8FAFC] to-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#707A8C] hover:bg-[#E3E8F0] hover:text-[#0F172A] transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isState
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "bg-[#D97706]/10 text-[#D97706]"
              }`}
            >
              {isState ? "State" : "Union Territory"}
            </span>
            {region.iso_code && (
              <span className="text-[11px] font-mono font-medium text-[#707A8C] bg-[#E3E8F0] px-2 py-0.5 rounded">
                ISO: {region.iso_code}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-[#0F172A]">{region.name}</h2>
          <p className="text-sm font-medium text-[#707A8C] mt-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#2563EB]" />
            <span>
              Capital:{" "}
              <strong className="text-[#0F172A]">{region.capital}</strong>
            </span>
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-4 mt-6 border-b border-[#E3E8F0]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition ${
                activeTab === "overview"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#707A8C] hover:text-[#0F172A]"
              }`}
            >
              Demographics & Overview
            </button>

            <button
              onClick={() => setActiveTab("json")}
              className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1 transition ${
                activeTab === "json"
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#707A8C] hover:text-[#0F172A]"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Live REST API Payload</span>
            </button>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" ? (
            <>
              {/* Demographics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] border border-[#E3E8F0] p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#707A8C] text-xs font-medium mb-1">
                    <Users className="w-4 h-4 text-[#059669]" />
                    <span>Population</span>
                  </div>
                  <p className="font-bold text-[#0F172A] text-sm md:text-base">
                    {formatPopulation(region.population)}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E3E8F0] p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#707A8C] text-xs font-medium mb-1">
                    <Globe className="w-4 h-4 text-[#2563EB]" />
                    <span>Geographical Zone</span>
                  </div>
                  <p className="font-bold text-[#0F172A] text-sm md:text-base">
                    {region.region || "India"}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E3E8F0] p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#707A8C] text-xs font-medium mb-1">
                    <MapPin className="w-4 h-4 text-[#D97706]" />
                    <span>Land Area</span>
                  </div>
                  <p className="font-bold text-[#0F172A] text-sm md:text-base">
                    {region.area_sq_km
                      ? `${region.area_sq_km.toLocaleString()} sq km`
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E3E8F0] p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[#707A8C] text-xs font-medium mb-1">
                    <Layers className="w-4 h-4 text-[#7C3AED]" />
                    <span>Population Density</span>
                  </div>
                  <p className="font-bold text-[#0F172A] text-sm md:text-base">
                    {region.density_per_sq_km
                      ? `${region.density_per_sq_km.toLocaleString()} / sq km`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Official Languages */}
              <div className="bg-white border border-[#E3E8F0] p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Official Language(s)
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {region.official_languages &&
                  region.official_languages.length > 0 ? (
                    region.official_languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold px-3 py-1 rounded-lg"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#707A8C]">
                      Not specified
                    </span>
                  )}
                </div>
              </div>

              {/* Governance & Metadata */}
              <div className="bg-white border border-[#E3E8F0] p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                  <span>Administrative Details</span>
                </h4>
                <div className="text-xs text-[#475569] space-y-2">
                  <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#707A8C]">Region ID (UUID):</span>
                    <span className="font-mono text-[11px] text-[#0F172A]">
                      {region.id}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                    <span className="text-[#707A8C]">ISO 3166-2 Code:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {region.iso_code || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#707A8C]">Capital City:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {region.capital}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Live JSON Payload Tab */
            <div className="bg-[#0F172A] text-[#F8FAFC] p-4 rounded-xl overflow-x-auto text-xs font-mono">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#334155] text-[11px] text-[#94A3B8]">
                <span>
                  GET /api/v1/regions?q={encodeURIComponent(region.name)}
                </span>
                <span className="text-[#059669]">200 OK</span>
              </div>
              <pre className="leading-relaxed">
                {JSON.stringify(region, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E3E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <span className="text-xs text-[#707A8C]">
            Source: Ministry of Home Affairs / Survey of India
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-[#1D4ED8] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
