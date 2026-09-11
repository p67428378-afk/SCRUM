import React, { useState, useEffect } from "react";
import { binsApi } from "../../services/api";
import {
  Trash2,
  AlertTriangle,
  RefreshCw,
  Activity,
  SlidersHorizontal,
  Plus,
} from "lucide-react";

export default function BinTelemetryTable() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selected bin for telemetry simulation
  const [updatingBinId, setUpdatingBinId] = useState(null);
  const [newFillLevel, setNewFillLevel] = useState(50);

  // New Bin Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBin, setNewBin] = useState({
    serial_number: `ECO-${Math.floor(1000 + Math.random() * 9000)}`,
    location_address: "5th Ave & Pine St",
    zone_code: "Zone 1",
    waste_type: "General",
    fill_level_pct: 20,
  });

  const fetchBins = async () => {
    setLoading(true);
    try {
      const params = {};
      if (zoneFilter) params.zone = zoneFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await binsApi.getBins(params);
      setBins(data || []);
    } catch (err) {
      console.error("Error fetching bins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
  }, [zoneFilter, statusFilter]);

  const handleUpdateTelemetry = async (binId) => {
    try {
      await binsApi.updateTelemetry(binId, {
        fill_level_pct: Number(newFillLevel),
      });
      setUpdatingBinId(null);
      fetchBins();
    } catch (err) {
      console.error("Error updating telemetry:", err);
    }
  };

  const handleCreateBin = async (e) => {
    e.preventDefault();
    try {
      await binsApi.createBin(newBin);
      setShowAddModal(false);
      fetchBins();
    } catch (err) {
      console.error("Error creating bin:", err);
    }
  };

  const getStatusBadge = (status, pct) => {
    let colorClass = "bg-slate-100 text-slate-700";
    if (pct >= 90 || status === "Overflowing") {
      colorClass = "bg-red-100 text-red-800 border border-red-200";
    } else if (pct >= 71 || status === "Full") {
      colorClass = "bg-amber-100 text-amber-800 border border-amber-200";
    } else if (pct >= 26 || status === "Moderate") {
      colorClass = "bg-blue-100 text-blue-800 border border-blue-200";
    } else {
      colorClass = "bg-emerald-100 text-emerald-800 border border-emerald-200";
    }
    return (
      <span
        className={`px-2 py-0.5 rounded-full font-semibold text-xs ${colorClass}`}
      >
        {status ||
          (pct >= 90
            ? "Overflowing"
            : pct >= 71
              ? "Full"
              : pct >= 26
                ? "Moderate"
                : "Empty")}
      </span>
    );
  };

  const getProgressBarColor = (pct) => {
    if (pct >= 90) return "bg-red-500";
    if (pct >= 71) return "bg-amber-500";
    if (pct >= 26) return "bg-blue-500";
    return "bg-emerald-500";
  };

  // Summary Metrics
  const totalBins = bins.length;
  const emptyCount = bins.filter((b) => b.fill_level_pct <= 25).length;
  const moderateCount = bins.filter(
    (b) => b.fill_level_pct > 25 && b.fill_level_pct <= 70,
  ).length;
  const fullCount = bins.filter(
    (b) => b.fill_level_pct > 70 && b.fill_level_pct < 90,
  ).length;
  const overflowCount = bins.filter((b) => b.fill_level_pct >= 90).length;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-xs flex flex-wrap justify-between items-center gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            ⚠️ LoRaWAN Gateway Active — Smart bins transmitting real-time fill
            capacity telemetry.
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Register Smart Bin
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Bins</p>
          <p className="text-2xl font-bold text-slate-900">{totalBins}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Empty (0-25%)</p>
          <p className="text-2xl font-bold text-emerald-600">{emptyCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Moderate (26-70%)
          </p>
          <p className="text-2xl font-bold text-blue-600">{moderateCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Full (71-89%)</p>
          <p className="text-2xl font-bold text-amber-600">{fullCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">
            Overflowing (90%+)
          </p>
          <p className="text-2xl font-bold text-red-600">{overflowCount}</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-blue-600" />
            Smart Bin Status Log
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
              >
                <option value="">All Zones</option>
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
            >
              <option value="">All Statuses</option>
              <option value="Empty">Empty</option>
              <option value="Moderate">Moderate</option>
              <option value="Full">Full</option>
              <option value="Overflowing">Overflowing</option>
            </select>

            <button
              onClick={fetchBins}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Loading smart bin data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Bin Serial</th>
                  <th className="p-2.5">Location Address</th>
                  <th className="p-2.5">Zone</th>
                  <th className="p-2.5">Waste Type</th>
                  <th className="p-2.5">Fill Level (%)</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Telemetry Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bins.map((bin) => (
                  <tr
                    key={bin.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-2.5 font-mono font-semibold text-slate-900">
                      {bin.serial_number}
                    </td>
                    <td className="p-2.5">{bin.location_address}</td>
                    <td className="p-2.5 font-medium">{bin.zone_code}</td>
                    <td className="p-2.5">{bin.waste_type}</td>
                    <td className="p-2.5 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full ${getProgressBarColor(bin.fill_level_pct)}`}
                            style={{
                              width: `${Math.min(100, Math.max(0, bin.fill_level_pct))}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-slate-700">
                          {bin.fill_level_pct}%
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5">
                      {getStatusBadge(bin.status, bin.fill_level_pct)}
                    </td>
                    <td className="p-2.5 text-right">
                      {updatingBinId === bin.id ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newFillLevel}
                            onChange={(e) => setNewFillLevel(e.target.value)}
                            className="w-14 p-1 border rounded text-xs text-center font-mono"
                          />
                          <button
                            onClick={() => handleUpdateTelemetry(bin.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setUpdatingBinId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setUpdatingBinId(bin.id);
                            setNewFillLevel(bin.fill_level_pct);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Activity className="w-3 h-3" /> Broadcast Sensor
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for adding new bin */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Register New Smart Bin
            </h3>
            <form onSubmit={handleCreateBin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-600">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={newBin.serial_number}
                  onChange={(e) =>
                    setNewBin({ ...newBin, serial_number: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">
                  Address
                </label>
                <input
                  type="text"
                  value={newBin.location_address}
                  onChange={(e) =>
                    setNewBin({ ...newBin, location_address: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-600">
                    Zone
                  </label>
                  <input
                    type="text"
                    value={newBin.zone_code}
                    onChange={(e) =>
                      setNewBin({ ...newBin, zone_code: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-600">
                    Waste Type
                  </label>
                  <input
                    type="text"
                    value={newBin.waste_type}
                    onChange={(e) =>
                      setNewBin({ ...newBin, waste_type: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-600">
                  Initial Fill Level (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newBin.fill_level_pct}
                  onChange={(e) =>
                    setNewBin({
                      ...newBin,
                      fill_level_pct: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
