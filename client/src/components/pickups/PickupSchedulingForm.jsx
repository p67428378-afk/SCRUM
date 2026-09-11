import React, { useState } from "react";
import { pickupsApi } from "../../services/api";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function PickupSchedulingForm({ onPickupCreated }) {
  const [formData, setFormData] = useState({
    waste_type: "Hazardous Waste",
    address: "123 Main St, Zone 2, Metro City",
    scheduled_date: "2026-06-01",
    time_slot: "09:00 - 12:00",
    special_notes: "2 sealed boxes at front curb near driveway",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const result = await pickupsApi.createPickup(formData);
      setSuccessMsg(
        `Appointment confirmed! Tracking Code: ${result.tracking_code || result.id}`,
      );
      if (onPickupCreated) {
        onPickupCreated(result);
      }
    } catch (err) {
      console.error("Pickup submission error:", err);
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
        : detail ||
          err.message ||
          "Failed to submit pickup request. Please try again.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        Schedule New Pickup Appointment
      </h2>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Waste Category
          </label>
          <select
            name="waste_type"
            value={formData.waste_type}
            onChange={handleChange}
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          >
            <option value="Hazardous Waste">
              Hazardous Waste (Paint, Electronics, Batteries)
            </option>
            <option value="General Waste">General Waste</option>
            <option value="Recyclables">Recyclables</option>
            <option value="Organic Waste">Organic Waste</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Location Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. 123 Main St, Zone 2"
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Preferred Date
            </label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Time Window
            </label>
            <select
              name="time_slot"
              value={formData.time_slot}
              onChange={handleChange}
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            >
              <option value="09:00 - 12:00">
                09:00 - 12:00 Slot (Available)
              </option>
              <option value="13:00 - 16:00">13:00 - 16:00 Slot</option>
              <option value="16:00 - 19:00">16:00 - 19:00 Slot</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Special Notes
          </label>
          <textarea
            name="special_notes"
            value={formData.special_notes}
            onChange={handleChange}
            rows={2}
            placeholder="Special instructions for driver..."
            className="w-full p-2.5 border border-slate-300 rounded-md text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
            </>
          ) : (
            "Confirm Appointment & Assign Tracking Code"
          )}
        </button>
      </form>
    </div>
  );
}
