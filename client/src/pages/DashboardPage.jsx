import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  Sun,
  CloudRain,
  Activity,
  AlertTriangle,
} from "lucide-react";
import TelemetryStatCard from "../components/dashboard/TelemetryStatCard";
import StationFocusPanel from "../components/dashboard/StationFocusPanel";
import StationTable from "../components/locations/StationTable";
import StationFormModal from "../components/locations/StationFormModal";
import { getLocations, getCurrentWeather } from "../services/api";

export default function DashboardPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const locs = await getLocations();
      setStations(locs);
      if (locs.length > 0 && !selectedStation) {
        setSelectedStation(locs[0]);
      }

      const locId =
        selectedStation?.id || (locs.length > 0 ? locs[0].id : null);
      if (locId) {
        const weather = await getCurrentWeather(locId);
        setCurrentWeather(weather);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      getCurrentWeather(selectedStation.id)
        .then((w) => setCurrentWeather(w))
        .catch((e) => console.error(e));
    }
  }, [selectedStation]);

  const tempCelsius = currentWeather?.temperature_celsius ?? 22.5;
  const tempFahrenheit = (tempCelsius * 9) / 5 + 32;

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Real-Time Weather Observation Dashboard
            </h1>
            <p className="text-xs text-[#BBC9CF] font-mono mt-1">
              Live meteorological sensor telemetry and active station telemetry
              monitoring
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono bg-[#171F33] px-3 py-2 rounded-lg border border-[#3C494E]">
            <Activity className="w-4 h-4 text-[#00D1FF] animate-pulse" />
            <span>
              Active Telemetry Focus:{" "}
              <strong className="text-white">
                {selectedStation?.name || "All Stations"}
              </strong>
            </span>
          </div>
        </div>

        {/* 6 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <TelemetryStatCard
            title="Temperature"
            value={tempCelsius.toFixed(1)}
            unit="°C"
            subtitle={`${tempFahrenheit.toFixed(1)} °F`}
            icon={Thermometer}
            color="primary"
          />
          <TelemetryStatCard
            title="Humidity"
            value={currentWeather?.humidity_percent ?? 64}
            unit="%"
            icon={Droplets}
            color="secondary"
          />
          <TelemetryStatCard
            title="Wind Speed"
            value={currentWeather?.wind_speed_mph ?? 12.5}
            unit="mph"
            subtitle={`Vector: ${currentWeather?.wind_direction || "NW"}`}
            icon={Wind}
            color="accent"
          />
          <TelemetryStatCard
            title="Barometric Pressure"
            value={currentWeather?.pressure_hpa ?? 1013.2}
            unit="hPa"
            icon={Compass}
            color="primary"
          />
          <TelemetryStatCard
            title="UV Index"
            value={currentWeather?.uv_index ?? 4.5}
            unit="UV"
            icon={Sun}
            color="warning"
          />
          <TelemetryStatCard
            title="Precipitation"
            value={currentWeather?.precipitation_inches ?? 0.05}
            unit="in/hr"
            icon={CloudRain}
            color="secondary"
          />
        </div>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StationTable
            stations={stations}
            selectedStationId={selectedStation?.id}
            onSelectStation={(st) => setSelectedStation(st)}
            onOpenAddModal={() => setIsModalOpen(true)}
            onRefresh={fetchData}
          />
        </div>

        <div className="lg:col-span-1">
          <StationFocusPanel
            station={selectedStation}
            onDataIngested={fetchData}
          />
        </div>
      </div>

      {/* Register Station Modal */}
      <StationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStationCreated={fetchData}
      />
    </div>
  );
}
