import React, { useState, useEffect } from "react";
import { routesApi } from "../../services/api";
import SkipReasonModal from "./SkipReasonModal";
import {
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Truck,
  MapPin,
  RefreshCw,
} from "lucide-react";

export default function DriverManifestTable() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeStatus, setRouteStatus] = useState("In Progress");
  const [loading, setLoading] = useState(true);

  // Skip Modal state
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Editable weights state per task
  const [weights, setWeights] = useState({});

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await routesApi.getRoutes();
      setRoutes(data || []);
      if (data && data.length > 0) {
        setSelectedRoute(data[0]);
      }
    } catch (err) {
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleWeightChange = (taskId, val) => {
    setWeights((prev) => ({ ...prev, [taskId]: val }));
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, extraData = {}) => {
    try {
      const weight =
        weights[taskId] !== undefined ? Number(weights[taskId]) : 250;
      await routesApi.updateTaskStatus(taskId, {
        task_status: newStatus,
        collected_weight_kg: weight,
        ...extraData,
      });

      // Local state update
      setSelectedRoute((prev) => {
        if (!prev) return prev;
        const updatedTasks = (prev.tasks || []).map((t) =>
          t.id === taskId
            ? {
                ...t,
                task_status: newStatus,
                collected_weight_kg: weight,
                ...extraData,
              }
            : t,
        );
        return { ...prev, tasks: updatedTasks };
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleSkipSubmit = async (data) => {
    await handleUpdateTaskStatus(data.taskId, "Skipped", {
      skip_reason: data.skip_reason,
      evidence_url: data.evidence_url,
    });
    setSkipModalOpen(false);
  };

  const tasks = selectedRoute?.tasks || [
    {
      id: "task-101",
      sequence_number: 1,
      bin: {
        location_address: "142 Harborview Blvd",
        waste_type: "General Waste",
      },
      task_status: "Completed",
      collected_weight_kg: 250,
    },
    {
      id: "task-102",
      sequence_number: 2,
      bin: { location_address: "344 Bayside Ave", waste_type: "Recyclables" },
      task_status: "Pending",
      collected_weight_kg: 0,
    },
    {
      id: "task-103",
      sequence_number: 3,
      bin: { location_address: "88 Market St", waste_type: "Organic Waste" },
      task_status: "Skipped",
      collected_weight_kg: 0,
      skip_reason: "Blocked Access",
    },
  ];

  const completedCount = tasks.filter(
    (t) => t.task_status === "Completed",
  ).length;
  const totalWeight = tasks.reduce(
    (acc, t) => acc + (t.collected_weight_kg || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-800 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-900">
              EcoClean Driver Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Driver #402 — Dave Miller (Truck #T-14)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {routeStatus === "In Progress" ? (
            <button
              onClick={() => setRouteStatus("Paused")}
              className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded shadow-sm hover:bg-amber-600 flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4" /> Pause Route
            </button>
          ) : (
            <button
              onClick={() => setRouteStatus("In Progress")}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" /> Start Route
            </button>
          )}
          <button
            onClick={fetchRoutes}
            className="p-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
            title="Refresh Manifest"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="border-r border-slate-200 pr-2">
          <p className="text-xs text-slate-500 font-medium">Active Route</p>
          <p className="text-base font-bold text-slate-900 truncate">
            {selectedRoute?.route_name || "RT-ZONE2-NORTH"}
          </p>
        </div>
        <div className="border-r border-slate-200 pr-2">
          <p className="text-xs text-slate-500 font-medium">Stops Progress</p>
          <p className="text-base font-bold text-blue-600">
            {completedCount} / {tasks.length} Done
          </p>
        </div>
        <div className="border-r border-slate-200 pr-2">
          <p className="text-xs text-slate-500 font-medium">Collected Weight</p>
          <p className="text-base font-bold text-slate-900">
            {totalWeight.toLocaleString()} kg
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Route Status</p>
          <p className="text-base font-bold text-emerald-600">{routeStatus}</p>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Collection Stop Manifest
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Stop Location</th>
                <th className="p-2.5">Waste Type</th>
                <th className="p-2.5">Logged Weight</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-bold text-slate-900">
                    {String(t.sequence_number || idx + 1).padStart(2, "0")}
                  </td>
                  <td className="p-2.5 font-medium text-slate-800">
                    {t.bin?.location_address ||
                      t.location_address ||
                      "Collection Stop"}
                  </td>
                  <td className="p-2.5">
                    {t.bin?.waste_type || t.waste_type || "General Waste"}
                  </td>
                  <td className="p-2.5">
                    <div className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        value={
                          weights[t.id] !== undefined
                            ? weights[t.id]
                            : t.collected_weight_kg || 250
                        }
                        onChange={(e) =>
                          handleWeightChange(t.id, e.target.value)
                        }
                        className="w-20 p-1 border border-slate-300 rounded text-xs text-center font-mono font-medium focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-slate-500 font-medium">kg</span>
                    </div>
                  </td>
                  <td className="p-2.5">
                    {t.task_status === "Completed" ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                        Completed
                      </span>
                    ) : t.task_status === "Skipped" ? (
                      <span
                        className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold inline-flex items-center gap-1"
                        title={t.skip_reason}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />{" "}
                        Skipped ({t.skip_reason || "Logged"})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-right space-x-2">
                    {t.task_status !== "Completed" && (
                      <button
                        onClick={() =>
                          handleUpdateTaskStatus(t.id, "Completed")
                        }
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold text-xs hover:bg-emerald-700 shadow-sm"
                      >
                        Complete
                      </button>
                    )}
                    {t.task_status !== "Skipped" && (
                      <button
                        onClick={() => {
                          setActiveTaskId(t.id);
                          setSkipModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-red-100 text-red-700 rounded font-semibold text-xs hover:bg-red-200"
                      >
                        Skip Stop
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SkipReasonModal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        onSubmit={handleSkipSubmit}
        taskId={activeTaskId}
      />
    </div>
  );
}
