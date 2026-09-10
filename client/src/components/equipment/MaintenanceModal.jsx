import React, { useState } from "react";
import ModalDialog from "../common/ModalDialog";

export default function MaintenanceModal({
  isOpen,
  onClose,
  equipment,
  onSubmit,
}) {
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [operatingHoursLogged, setOperatingHoursLogged] = useState(
    equipment?.operating_hours || 1250,
  );
  const [serviceType, setServiceType] = useState("Preventative");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!serviceDate || !description.trim()) {
      setError("Service Date and Description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        equipment_id: equipment?.id || "eq-201",
        service_date: serviceDate,
        operating_hours_logged: Number(operatingHoursLogged) || 0,
        service_type: serviceType,
        description: description.trim(),
        cost: Number(cost) || 0,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to log maintenance.",
      );
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Maintenance for ${equipment?.name || "Equipment"}`}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <p className="text-slate-600 font-medium">
            Asset:{" "}
            <span className="font-bold text-slate-800">
              {equipment?.name} ({equipment?.serial_number})
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Date *
            </label>
            <input
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operating Hours Meter *
            </label>
            <input
              type="number"
              value={operatingHoursLogged}
              onChange={(e) => setOperatingHoursLogged(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Type *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="Preventative">Preventative Maintenance</option>
              <option value="Repair">Emergency Repair</option>
              <option value="Inspection">Routine Inspection</option>
              <option value="Overhaul">Component Overhaul</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cost ($ USD)
            </label>
            <input
              type="number"
              placeholder="e.g. 450"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Work Done & Parts Replaced *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. Changed engine oil & filter; replaced hydraulic fluid filter; greased chassis points."
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            required
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
            {isSubmitting ? "Saving..." : "Save Maintenance Log"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}
