import React, { useState } from "react";
import { Search, MapPin, Plus, Radio, RefreshCw } from "lucide-react";

export default function StationTable({
  stations = [],
  selectedStationId,
  onSelectStation,
  onOpenAddModal,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStations = stations.filter(
    (station) =>
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.country?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="p-4 border-b border-[#3C494E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-[#BBC9CF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#BBC9CF] outline-none focus:border-[#00D1FF]"
            />
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 bg-[#222A3D] text-[#BBC9CF] hover:text-white border border-[#3C494E] rounded-lg transition"
              title="Refresh Stations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Station</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#222A3D] text-[#BBC9CF] font-mono border-b border-[#3C494E]">
            <tr>
              <th className="p-4">STATION NAME</th>
              <th className="p-4">LOCATION</th>
              <th className="p-4">GPS COORDINATES</th>
              <th className="p-4">ELEVATION</th>
              <th className="p-4">STATUS</th>
              <th className="p-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3C494E]/50">
            {filteredStations.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#BBC9CF]">
                  No weather stations found. Register a station to start
                  tracking weather data.
                </td>
              </tr>
            ) : (
              filteredStations.map((st) => {
                const isSelected = selectedStationId === st.id;
                const isOffline =
                  st.status === "OFFLINE" || st.status === "INACTIVE";
                return (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStation && onSelectStation(st)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? "bg-[#00D1FF]/10 border-l-4 border-l-[#00D1FF]"
                        : "hover:bg-[#222A3D]/50"
                    }`}
                  >
                    <td className="p-4 font-semibold text-white flex items-center space-x-2">
                      <Radio
                        className={`w-4 h-4 ${isSelected ? "text-[#00D1FF]" : "text-[#BBC9CF]"}`}
                      />
                      <span>{st.name}</span>
                    </td>
                    <td className="p-4 text-[#BBC9CF]">
                      {st.city ? `${st.city}, ` : ""}
                      {st.state ? `${st.state}, ` : ""}
                      {st.country || "Global"}
                    </td>
                    <td className="p-4 font-mono text-[#00D1FF]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#BBC9CF]" />
                        {st.latitude?.toFixed(4)}°, {st.longitude?.toFixed(4)}°
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#BBC9CF]">
                      {st.elevation_meters ?? 0} m
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                          isOffline
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isOffline ? "Offline" : "ACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectStation) onSelectStation(st);
                        }}
                        className={`px-3 py-1 rounded font-mono text-xs transition ${
                          isSelected
                            ? "bg-[#00D1FF] text-black font-semibold"
                            : "bg-[#222A3D] text-[#BBC9CF] hover:text-white border border-[#3C494E]"
                        }`}
                      >
                        {isSelected ? "Focused" : "Inspect"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
