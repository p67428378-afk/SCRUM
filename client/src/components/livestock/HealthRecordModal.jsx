import React, { useState } from "react";
import ModalDialog from "../common/ModalDialog";

export default function HealthRecordModal({
  isOpen,
  onClose,
  animal,
  onSubmit,
}) {
  const [eventType, setEventType] = useState("Vaccination");
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [medicationName, setMedicationName] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Mandatory business rule check:
    if (!eventDate || !animal?.tag_number || !medicationName.trim()) {
      setError(
        "Business Rule Enforced: Event Date, Batch/Tag ID, and Medication/Vaccine Name are mandatory for medical records.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        livestock_id: animal?.id || "ls-001",
        event_type: eventType,
        event_date: eventDate,
        medication_name: medicationName.trim(),
        next_due_date: nextDueDate || null,
        notes: notes,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to save health record.",
      );
    }
  };

  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Health Event for ${animal?.tag_number || "Animal"}`}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <p className="text-slate-600 font-medium">
            Target Animal:{" "}
            <span className="font-bold text-slate-800">
              {animal?.tag_number} ({animal?.species} - {animal?.breed})
            </span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Event Type *
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            <option value="Vaccination">Vaccination</option>
            <option value="Inspection">Health Inspection</option>
            <option value="Treatment">Medical Treatment</option>
            <option value="Feeding Log">Specialized Feeding Log</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Date *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Booster / Inspection Due
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Medication / Vaccine Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Bovilis Vision 8 / Ivermectin Pour-On"
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Dosage & Observations / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Administered 2ml SQ. Animal in good condition, no adverse reactions."
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
            {isSubmitting ? "Saving..." : "Save Health Record"}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
}
