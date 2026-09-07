import React, { useState, useEffect } from "react";
import { MapPin, Plus, Compass, Globe, Shield, RefreshCw } from "lucide-react";
import StationTable from "../components/locations/StationTable";
import StationFormModal from "../components/locations/StationFormModal";
import { getLocations } from "../services/api";

export default function LocationsPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setStations(data);
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch stations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const activeCount = stations.filter(
    (s) => s.status !== "OFFLINE" && s.status !== "INACTIVE",
  ).length;
  const offlineCount = stations.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Weather Monitoring Stations & Locations
          </h1>
          <p className="text-xs text-[#BBC9CF] font-mono mt-1">
            Geographic location directory, GPS coordinate tracking (-90° to 90°
            lat / -180° to 180° lon), and station health telemetry
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black px-4 py-2.5 rounded-lg text-xs font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Station</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-4 flex items-center space-x-4">
          <div className="p-3 bg-[#00D1FF]/10 rounded-lg border border-[#00D1FF]/30 text-[#00D1FF]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-[#BBC9CF] block">
              TOTAL STATIONS
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {stations.length}
            </span>
          </div>
        </div>

        <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-[#BBC9CF] block font-semibold">
              ACTIVE TELEMETRY
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {activeCount}
            </span>
          </div>
        </div>

        <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-4 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-red-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono text-[#BBC9CF] block font-semibold">
              DATA UNAVAILABLE / OFFLINE
            </span>
            <span className="text-2xl font-bold font-mono text-red-400">
              {offlineCount}
            </span>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <StationTable
        stations={stations}
        selectedStationId={selectedStation?.id}
        onSelectStation={(st) => setSelectedStation(st)}
        onOpenAddModal={() => setIsModalOpen(true)}
        onRefresh={fetchStations}
      />

      {/* Registration Modal */}
      <StationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStationCreated={fetchStations}
      />
    </div>
  );
}
