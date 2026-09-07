import React, { useState } from "react";
import {
  MapPin,
  Compass,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  Send,
} from "lucide-react";
import { ingestWeatherData } from "../../services/api";

export default function StationFocusPanel({ station, onDataIngested }) {
  const [ingestForm, setIngestForm] = useState({
    temperature_celsius: 22.5,
    humidity_percent: 64,
    wind_speed_mph: 12.5,
    wind_direction: "NW",
    precipitation_inches: 0.05,
    pressure_hpa: 1013.25,
    uv_index: 4.5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!station) {
    return (
      <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-6 text-center text-[#BBC9CF]">
        <Compass className="w-12 h-12 mx-auto mb-3 text-[#3C494E]" />
        <p className="text-sm font-medium">
          Select a weather station to inspect detailed telemetry
        </p>
      </div>
    );
  }

  const isOffline =
    station.status === "OFFLINE" || station.status === "INACTIVE";

  const handleIngestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        location_id: station.id,
        temperature_celsius: parseFloat(ingestForm.temperature_celsius),
        humidity_percent: parseFloat(ingestForm.humidity_percent),
        wind_speed_mph: parseFloat(ingestForm.wind_speed_mph),
        wind_direction: ingestForm.wind_direction,
        precipitation_inches: parseFloat(ingestForm.precipitation_inches),
        pressure_hpa: parseFloat(ingestForm.pressure_hpa),
        uv_index: parseFloat(ingestForm.uv_index),
        recorded_at: new Date().toISOString(),
      };
      await ingestWeatherData(payload);
      setMessage({
        type: "success",
        text: "Telemetry reading ingested successfully!",
      });
      if (onDataIngested) onDataIngested();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to ingest weather data",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-[#3C494E]">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white">{station.name}</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                isOffline
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {isOffline ? "Data Unavailable / Offline" : "ACTIVE"}
            </span>
          </div>
          <p className="text-xs text-[#BBC9CF] flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#00D1FF]" />
            {station.city || "Unknown City"}, {station.state || ""}{" "}
            {station.country || ""}
          </p>
        </div>
      </div>

      {/* GPS & Sensor Metadata */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-[#3C494E] text-xs font-mono">
        <div className="bg-[#222A3D] p-3 rounded-lg border border-[#3C494E]/60">
          <span className="text-[#BBC9CF] block mb-1">
            LATITUDE / LONGITUDE
          </span>
          <span className="text-[#00D1FF] font-medium">
            {station.latitude?.toFixed(4)}°, {station.longitude?.toFixed(4)}°
          </span>
        </div>
        <div className="bg-[#222A3D] p-3 rounded-lg border border-[#3C494E]/60">
          <span className="text-[#BBC9CF] block mb-1">ELEVATION</span>
          <span className="text-white font-medium">
            {station.elevation_meters ?? 0} meters
          </span>
        </div>
      </div>

      {/* Ingest Simulated Telemetry Form */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#00D1FF]" /> Ingest Live Observation
          Reading
        </h4>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 text-xs font-mono border ${
              message.type === "success"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/20 border-red-500/40 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleIngestSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#BBC9CF] mb-1">Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={ingestForm.temperature_celsius}
                onChange={(e) =>
                  setIngestForm({
                    ...ingestForm,
                    temperature_celsius: e.target.value,
                  })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded px-3 py-1.5 text-white font-mono focus:border-[#00D1FF] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#BBC9CF] mb-1">Humidity (%)</label>
              <input
                type="number"
                step="0.1"
                value={ingestForm.humidity_percent}
                onChange={(e) =>
                  setIngestForm({
                    ...ingestForm,
                    humidity_percent: e.target.value,
                  })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded px-3 py-1.5 text-white font-mono focus:border-[#00D1FF] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#BBC9CF] mb-1">
                Wind Speed (mph)
              </label>
              <input
                type="number"
                step="0.1"
                value={ingestForm.wind_speed_mph}
                onChange={(e) =>
                  setIngestForm({
                    ...ingestForm,
                    wind_speed_mph: e.target.value,
                  })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded px-3 py-1.5 text-white font-mono focus:border-[#00D1FF] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#BBC9CF] mb-1">
                Precipitation (in/hr)
              </label>
              <input
                type="number"
                step="0.01"
                value={ingestForm.precipitation_inches}
                onChange={(e) =>
                  setIngestForm({
                    ...ingestForm,
                    precipitation_inches: e.target.value,
                  })
                }
                className="w-full bg-[#222A3D] border border-[#3C494E] rounded px-3 py-1.5 text-white font-mono focus:border-[#00D1FF] outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black font-semibold rounded-lg transition text-xs font-mono flex items-center justify-center gap-2"
          >
            {submitting
              ? "Transmitting Reading..."
              : "Transmit Telemetry Reading"}
          </button>
        </form>
      </div>
    </div>
  );
}
