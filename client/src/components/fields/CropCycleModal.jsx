import React, { useState } from "react";
import ModalDialog from "../common/ModalDialog";

export default function CropCycleModal({ isOpen, onClose, field, onSubmit }) {
  const [cropType, setCropType] = useState("Corn");
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [targetHarvestDate, setTargetHarvestDate] = useState("");
  const [soilHealthNotes, setSoilHealthNotes] = useState("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (e) => {
    const val = e.target.value;
    setCropType(val);
    if (field && field.current_crop && field.current_crop !== "None / Fallow") {
      setWarning(
        `Warning: ${field.name} already has an active crop cycle (${field.current_crop}). Ensure planting dates do not overlap.`,
      );
    } else {
      setWarning("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cropType || !plantingDate || !targetHarvestDate) {
      setError("Please complete all required fields.");
      return;
    }

    if (new Date(targetHarvestDate) <= new Date(plantingDate)) {
      setError("Target harvest date must be after planting date.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        field_id: field?.id || "f-101",
        crop_type: cropType,
        planting_date: plantingDate,
        target_harvest_date: targetHarvestDate,
        soil_health_notes: soilHealthNotes,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to schedule crop cycle.",
      );
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Crop Cycle for ${field?.name || "Field"}`}
      error={error}
      warning={warning}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Crop Type *
          </label>
          <select
            value={cropType}
            onChange={handleFieldChange}
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="Corn">Corn / Maize</option>
            <option value="Soybeans">Soybeans</option>
            <option value="Winter Wheat">Winter Wheat</option>
            <option value="Alfalfa">Alfalfa</option>
            <option value="Cover Crop">Cover Crop (Rye / Clover)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Planting Date *
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Harvest Date *
            </label>
            <input
              type="date"
              value={targetHarvestDate}
              onChange={(e) => setTargetHarvestDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Soil Health Metrics & Notes
          </label>
          <textarea
            value={soilHealthNotes}
            onChange={(e) => setSoilHealthNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Pre-planting NPK application done; pH 6.8; high organic matter."
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-emerald-800 text-white rounded-md text-xs font-bold hover:bg-emerald-900 disabled:opacity-50"
          >
            {isSubmitting ? "Scheduling..." : "Save Crop Cycle"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}
