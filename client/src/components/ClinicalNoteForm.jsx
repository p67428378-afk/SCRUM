import React, { useState, useEffect } from "react";
import { X, FilePlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createMedicalRecord, getDoctors } from "../services/api";

export default function ClinicalNoteForm({
  isOpen,
  onClose,
  patientId,
  onRecordCreated,
}) {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: "",
    allergies: "",
    current_medications: "",
    clinical_notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch available doctors for selection dropdown
      getDoctors()
        .then((data) => setDoctors(data || []))
        .catch((err) => console.error("Failed to load doctors list:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        patient_id: patientId,
        doctor_id: formData.doctor_id || null,
        allergies: formData.allergies.trim() || null,
        current_medications: formData.current_medications.trim() || null,
        clinical_notes: formData.clinical_notes.trim(),
      };

      const result = await createMedicalRecord(payload);
      setLoading(false);
      if (onRecordCreated) {
        onRecordCreated(result);
      }
      onClose();
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        const msgs = detail
          .map((d) => `${d.loc.join(".")}: ${d.msg}`)
          .join(", ");
        setError(msgs);
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          "Failed to append clinical note. Please check required fields.",
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
            <FilePlus className="w-5 h-5" />
            <span>Append Clinical Note</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Attending Doctor / Healthcare Provider
            </label>
            <select
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select Doctor (Optional)</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.full_name} ({doc.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Known Allergies (if any)
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Current Active Medications
              </label>
              <input
                type="text"
                name="current_medications"
                value={formData.current_medications}
                onChange={handleChange}
                placeholder="e.g. Amoxicillin 500mg BID"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Notes & Consultation Findings{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="clinical_notes"
              required
              rows="5"
              value={formData.clinical_notes}
              onChange={handleChange}
              placeholder="Record clinical examination notes, diagnosis, observations, or treatment recommendations..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Note...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
