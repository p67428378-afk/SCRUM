import React, { useState } from "react";
import {
  Bell,
  Plus,
  Shield,
  CheckCircle,
  AlertOctagon,
  Mail,
} from "lucide-react";
import { createAlertConfig } from "../../services/api";

export default function AlertConfigTable({
  alertConfigs = [],
  locations = [],
  onConfigCreated,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    location_id: "",
    metric_type: "TEMPERATURE",
    operator: "GREATER_THAN",
    threshold_value: "35",
    user_email: "analyst@weatherpulse.org",
    is_active: true,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!formData.location_id) {
      setError("Please select a target weather station.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        location_id: formData.location_id,
        metric_type: formData.metric_type,
        operator: formData.operator,
        threshold_value: parseFloat(formData.threshold_value),
        user_email: formData.user_email,
        is_active: formData.is_active,
      };
      await createAlertConfig(payload);
      if (onConfigCreated) onConfigCreated();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Failed to create threshold alert configuration.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getLocationName = (locId) => {
    const found = locations.find((l) => l.id === locId);
    return found ? found.name : locId || "All Stations";
  };

  return (
    <div className="bg-[#171F33] rounded-xl border border-[#3C494E] shadow-xl overflow-hidden mb-8">
      {/* Table Header */}
      <div className="p-4 border-b border-[#3C494E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00D1FF]" /> Threshold Alert Rules
            Configuration
          </h3>
          <p className="text-xs text-[#BBC9CF] font-mono mt-0.5 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#10B981]" /> Automated
            evaluation with 1-minute dispatch throttling
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black px-4 py-2 rounded-lg text-xs font-semibold transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Configure New Alert Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#222A3D] text-[#BBC9CF] font-mono border-b border-[#3C494E]">
            <tr>
              <th className="p-4">STATION</th>
              <th className="p-4">METRIC TYPE</th>
              <th className="p-4">CONDITION</th>
              <th className="p-4">THRESHOLD</th>
              <th className="p-4">NOTIFICATION EMAIL</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3C494E]/50">
            {alertConfigs.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#BBC9CF]">
                  No active alert threshold configurations found. Click
                  "Configure New Alert Rule" to add one.
                </td>
              </tr>
            ) : (
              alertConfigs.map((config) => (
                <tr
                  key={config.id}
                  className="hover:bg-[#222A3D]/40 transition"
                >
                  <td className="p-4 font-semibold text-white">
                    {getLocationName(config.location_id)}
                  </td>
                  <td className="p-4 font-mono text-[#00D1FF] font-semibold">
                    {config.metric_type}
                  </td>
                  <td className="p-4 font-mono text-[#BBC9CF]">
                    {config.operator === "GREATER_THAN"
                      ? "> (Greater Than)"
                      : config.operator === "LESS_THAN"
                        ? "< (Less Than)"
                        : "= (Equals)"}
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-400">
                    {config.threshold_value}
                  </td>
                  <td className="p-4 font-mono text-[#BBC9CF] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#00D1FF]" />
                    {config.user_email}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                        config.is_active !== false
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {config.is_active !== false ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171F33] border border-[#3C494E] rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#00D1FF]" /> Create Weather
              Threshold Alert Rule
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-xs font-mono text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#BBC9CF] mb-1 font-semibold">
                  Target Station *
                </label>
                <select
                  required
                  value={formData.location_id}
                  onChange={(e) =>
                    setFormData({ ...formData, location_id: e.target.value })
                  }
                  className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
                >
                  <option value="">-- Select Weather Station --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city || "Station"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#BBC9CF] mb-1 font-semibold">
                    Metric Type
                  </label>
                  <select
                    value={formData.metric_type}
                    onChange={(e) =>
                      setFormData({ ...formData, metric_type: e.target.value })
                    }
                    className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
                  >
                    <option value="TEMPERATURE">TEMPERATURE (°C)</option>
                    <option value="WIND_SPEED">WIND SPEED (mph)</option>
                    <option value="PRECIPITATION">PRECIPITATION (in)</option>
                    <option value="UV_INDEX">UV INDEX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#BBC9CF] mb-1 font-semibold">
                    Operator
                  </label>
                  <select
                    value={formData.operator}
                    onChange={(e) =>
                      setFormData({ ...formData, operator: e.target.value })
                    }
                    className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
                  >
                    <option value="GREATER_THAN">Greater Than (&gt;)</option>
                    <option value="LESS_THAN">Less Than (&lt;)</option>
                    <option value="EQUALS">Equals (=)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#BBC9CF] mb-1 font-semibold">
                  Threshold Limit Value *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 35.0"
                  value={formData.threshold_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      threshold_value: e.target.value,
                    })
                  }
                  className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div>
                <label className="block text-[#BBC9CF] mb-1 font-semibold">
                  Notification Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="analyst@weatherpulse.org"
                  value={formData.user_email}
                  onChange={(e) =>
                    setFormData({ ...formData, user_email: e.target.value })
                  }
                  className="w-full bg-[#222A3D] border border-[#3C494E] rounded-lg px-3 py-2 text-white font-mono outline-none focus:border-[#00D1FF]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active_cb"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded border-[#3C494E] text-[#00D1FF] focus:ring-0 bg-[#222A3D]"
                />
                <label
                  htmlFor="is_active_cb"
                  className="text-[#BBC9CF] font-semibold"
                >
                  Enable Alert Rule Immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#3C494E]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#222A3D] text-[#BBC9CF] hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#00D1FF] hover:bg-[#4CDEFF] text-black font-semibold rounded-lg transition"
                >
                  {submitting ? "Saving Rule..." : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
