import React, { useState, useEffect } from "react";
import SearchBar from "../components/directory/SearchBar";
import FilterToggles from "../components/directory/FilterToggles";
import RegionCard from "../components/directory/RegionCard";
import IndiaVectorMap from "../components/map/IndiaVectorMap";
import RegionDetailDrawer from "../components/drawer/RegionDetailDrawer";
import { fetchRegions } from "../services/api";
import {
  MapPin,
  Building2,
  Users,
  AlertCircle,
  RefreshCw,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("split"); // 'grid' | 'map' | 'split'
  const [selectedRegion, setSelectedRegion] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRegions(activeFilter, searchQuery);
      setRegions(data);
    } catch (err) {
      setError("Failed to fetch regional location data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeFilter, searchQuery]);

  // Compute KPI metrics
  const totalRegions = regions.length;
  const statesCount = regions.filter((r) => r.type === "state").length;
  const utCount = regions.filter((r) => r.type === "union_territory").length;
  const totalPopulation = regions.reduce(
    (sum, r) => sum + (r.population || 0),
    0,
  );

  const formatPopulationShort = (num) => {
    if (!num) return "0";
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-8">
      {/* Page Title & KPI Cards */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">
            <span>Official GIS Directory</span>
            <span>•</span>
            <span>28 States & 8 Union Territories</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A]">
            Indian States & Capital Cities Directory
          </h1>
          <p className="text-sm text-[#707A8C] mt-1">
            Interactive geographical list and vector map for exploring regional
            data across India.
          </p>
        </div>

        {/* Metric Group / KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E3E8F0] p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-medium text-[#707A8C]">
              Total Administrative Regions
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-[#0F172A]">
                {totalRegions}
              </p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                36 Total
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8F0] p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-medium text-[#707A8C]">States Count</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-[#2563EB]">{statesCount}</p>
              <span className="text-xs font-semibold text-[#707A8C]">
                of 28
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8F0] p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-medium text-[#707A8C]">
              Union Territories
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-[#D97706]">{utCount}</p>
              <span className="text-xs font-semibold text-[#707A8C]">of 8</span>
            </div>
          </div>

          <div className="bg-white border border-[#E3E8F0] p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-medium text-[#707A8C]">
              Aggregated Population
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-[#059669]">
                {formatPopulationShort(totalPopulation)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-white border border-[#E3E8F0] p-4 rounded-2xl shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterToggles
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/20 p-4 rounded-2xl flex items-center justify-between text-sm text-[#DC2626]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 font-semibold underline hover:opacity-80"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white h-48 border border-[#E3E8F0] rounded-2xl p-5"
            />
          ))}
        </div>
      ) : (
        /* Main View Container */
        <div>
          {/* Empty State */}
          {regions.length === 0 ? (
            <div className="bg-white border border-[#E3E8F0] p-12 rounded-2xl text-center space-y-3">
              <Layers className="w-12 h-12 text-[#707A8C] mx-auto" />
              <h3 className="font-bold text-[#0F172A] text-lg">
                No matching regions found
              </h3>
              <p className="text-xs text-[#707A8C]">
                Try adjusting your search query "{searchQuery}" or changing the
                filter toggle.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Split View */}
              {viewMode === "split" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {regions.map((region) => (
                      <RegionCard
                        key={region.id || region.name}
                        region={region}
                        onSelect={setSelectedRegion}
                      />
                    ))}
                  </div>

                  <div className="lg:col-span-5 sticky top-24">
                    <IndiaVectorMap
                      regions={regions}
                      onSelectRegion={setSelectedRegion}
                      selectedRegion={selectedRegion}
                    />
                  </div>
                </div>
              )}

              {/* Grid View Only */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regions.map((region) => (
                    <RegionCard
                      key={region.id || region.name}
                      region={region}
                      onSelect={setSelectedRegion}
                    />
                  ))}
                </div>
              )}

              {/* Map View Only */}
              {viewMode === "map" && (
                <div className="max-w-3xl mx-auto">
                  <IndiaVectorMap
                    regions={regions}
                    onSelectRegion={setSelectedRegion}
                    selectedRegion={selectedRegion}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Region Details Drawer */}
      <RegionDetailDrawer
        region={selectedRegion}
        onClose={() => setSelectedRegion(null)}
      />
    </div>
  );
}
