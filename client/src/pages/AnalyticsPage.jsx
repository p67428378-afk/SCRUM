import React, { useState, useEffect } from "react";
import ZonalDistributionChart from "../components/analytics/ZonalDistributionChart";
import UTDirectoryTable from "../components/analytics/UTDirectoryTable";
import RegionDetailDrawer from "../components/drawer/RegionDetailDrawer";
import { fetchRegions } from "../services/api";
import { BarChart2, Shield, Globe, Users } from "lucide-react";

export default function AnalyticsPage() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchRegions("all");
        setRegions(data);
      } catch (err) {
        console.error("Analytics page load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB] mb-1">
          <BarChart2 className="w-4 h-4" />
          <span>Regional GIS Analytics</span>
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]">
          Geography Analytics Overview
        </h1>
        <p className="text-sm text-[#707A8C] mt-1">
          Zonal council distribution, administrative classifications, and Union
          Territory governance breakdown.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-64 bg-white border border-[#E3E8F0] rounded-2xl" />
          <div className="h-64 bg-white border border-[#E3E8F0] rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-8">
          <ZonalDistributionChart regions={regions} />
          <UTDirectoryTable
            regions={regions}
            onSelectRegion={setSelectedRegion}
          />
        </div>
      )}

      {/* Region Detail Drawer */}
      <RegionDetailDrawer
        region={selectedRegion}
        onClose={() => setSelectedRegion(null)}
      />
    </div>
  );
}
