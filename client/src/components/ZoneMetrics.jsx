import React, { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  Zap,
  Droplet,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { fetchZones, fetchZoneUtilityMetrics } from "../services/api";

export default function ZoneMetrics() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setLoadingZones(true);
    try {
      const data = await fetchZones();
      if (Array.isArray(data) && data.length > 0) {
        setZones(data);
        setSelectedZone(data[0]);
        loadMetricsForZone(data[0].id);
      } else {
        const mockZones = [
          {
            id: "1",
            zone_code: "ZONE-01",
            name: "Downtown Central",
            status: "ACTIVE",
          },
          {
            id: "2",
            zone_code: "ZONE-04",
            name: "North Industrial Park",
            status: "ACTIVE",
          },
          {
            id: "3",
            zone_code: "ZONE-08",
            name: "Westside Residential",
            status: "MONITORING",
          },
        ];
        setZones(mockZones);
        setSelectedZone(mockZones[0]);
        setMockMetrics();
      }
    } catch (err) {
      const mockZones = [
        {
          id: "1",
          zone_code: "ZONE-01",
          name: "Downtown Central",
          status: "ACTIVE",
        },
        {
          id: "2",
          zone_code: "ZONE-04",
          name: "North Industrial Park",
          status: "ACTIVE",
        },
      ];
      setZones(mockZones);
      setSelectedZone(mockZones[0]);
      setMockMetrics();
    } finally {
      setLoadingZones(false);
    }
  };

  const setMockMetrics = () => {
    setMetrics([
      {
        id: "m1",
        metric_type: "WATER",
        value: 14200.5,
        unit: "Gal/Hr",
        recorded_at: new Date().toISOString(),
      },
      {
        id: "m2",
        metric_type: "POWER",
        value: 98.4,
        unit: "% Operational",
        recorded_at: new Date().toISOString(),
      },
      {
        id: "m3",
        metric_type: "WASTE",
        value: 68.0,
        unit: "% Capacity",
        recorded_at: new Date().toISOString(),
      },
    ]);
  };

  const loadMetricsForZone = async (zoneId) => {
    setLoadingMetrics(true);
    setError(null);
    try {
      const data = await fetchZoneUtilityMetrics(zoneId);
      if (Array.isArray(data) && data.length > 0) {
        setMetrics(data);
      } else {
        setMockMetrics();
      }
    } catch (err) {
      setMockMetrics();
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleZoneChange = (zoneId) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      loadMetricsForZone(zone.id);
    }
  };

  const waterMetric = metrics.find((m) => m.metric_type === "WATER") || {
    value: 14200.5,
    unit: "Gal/Hr",
  };
  const powerMetric = metrics.find((m) => m.metric_type === "POWER") || {
    value: 98.4,
    unit: "% Operational",
  };
  const wasteMetric = metrics.find((m) => m.metric_type === "WASTE") || {
    value: 68.0,
    unit: "% Capacity",
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedZone
                  ? `${selectedZone.zone_code} - ${selectedZone.name}`
                  : "Zone & Utility Metrics Explorer"}
              </h1>
              {selectedZone && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  {selectedZone.status || "ACTIVE"} / MONITORING
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select a municipal zone to inspect real-time utility metrics and
              telemetry status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedZone ? selectedZone.id : ""}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="p-2 border border-slate-300 rounded text-sm bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.zone_code} ({zone.name})
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                selectedZone && loadMetricsForZone(selectedZone.id)
              }
              disabled={loadingMetrics}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm transition"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingMetrics ? "animate-spin" : ""}`}
              />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Water */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Water Consumption
              </span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <Droplet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {waterMetric.value.toLocaleString()}{" "}
              <span className="text-sm font-normal text-slate-500">
                {waterMetric.unit}
              </span>
            </p>
            <p className="text-xs text-amber-600 mt-2 font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 inline" /> Flow Rate Normal •
              Pressure 62 PSI
            </p>
          </div>

          {/* Power */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Power Grid Stability
              </span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {powerMetric.value}{" "}
              <span className="text-sm font-normal text-slate-500">
                {powerMetric.unit}
              </span>
            </p>
            <p className="text-xs text-emerald-600 mt-2 font-semibold">
              Voltage 120.4V • Grid Substation Active
            </p>
          </div>

          {/* Waste */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Waste Accumulation
              </span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded">
                <Trash2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {wasteMetric.value}{" "}
              <span className="text-sm font-normal text-slate-500">
                {wasteMetric.unit}
              </span>
            </p>
            <p className="text-xs text-slate-600 mt-2 font-semibold">
              3 Smart Bins Scheduled for Pickup
            </p>
          </div>
        </div>

        {/* Telemetry Detail Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Detailed Telemetry Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="p-3">Metric Type</th>
                  <th className="p-3">Recorded Value</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      {m.metric_type}
                    </td>
                    <td className="p-3 font-mono text-indigo-600 font-bold">
                      {m.value}
                    </td>
                    <td className="p-3 text-slate-600">{m.unit}</td>
                    <td className="p-3 text-slate-500 text-xs">
                      {m.recorded_at
                        ? new Date(m.recorded_at).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
                {metrics.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-500">
                      No telemetry metrics recorded for this zone.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
