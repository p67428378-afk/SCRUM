import React, { useState } from "react";
import {
  Activity,
  AlertCircle,
  Plus,
  Edit2,
  Check,
  Clock,
  ShieldAlert,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";
import { updateMedicalHistory } from "../services/api";

export default function MedicalHistoryTimeline({
  patientId,
  medicalRecord,
  onRefresh,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Local state for editing form
  const [allergiesInput, setAllergiesInput] = useState(
    medicalRecord?.allergies ? medicalRecord.allergies.join(", ") : "",
  );
  const [chronicInput, setChronicInput] = useState(
    medicalRecord?.chronic_conditions
      ? medicalRecord.chronic_conditions.join(", ")
      : "",
  );
  const [medicationsInput, setMedicationsInput] = useState(
    medicalRecord?.current_medications
      ? medicalRecord.current_medications.join(", ")
      : "",
  );
  const [visitNotesInput, setVisitNotesInput] = useState(
    medicalRecord?.visit_notes || "",
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSaveSuccess(false);

    const allergiesArray = allergiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const chronicArray = chronicInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const medsArray = medicationsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      allergies: allergiesArray,
      chronic_conditions: chronicArray,
      current_medications: medsArray,
      visit_notes: visitNotesInput,
    };

    try {
      await updateMedicalHistory(patientId, payload);
      setIsSubmitting(false);
      setIsEditing(false);
      setSaveSuccess(true);
      if (onRefresh) onRefresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setIsSubmitting(false);
      const msg =
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : err.message || "Failed to update medical history record.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 mb-6">
      {/* Header & Edit Button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Medical Record & Clinical History
          </h2>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Update Medical Record
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Cancel Editing
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center">
          <Check className="w-4 h-4 mr-2 text-emerald-600" />
          Medical record updated successfully with automatic UTC audit log!
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
          {errorMessage}
        </div>
      )}

      {/* Edit Mode View */}
      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Known Allergies (Comma-separated)
            </label>
            <input
              type="text"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              placeholder="Penicillin - Severe, Latex, Peanuts"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chronic Conditions (Comma-separated)
            </label>
            <input
              type="text"
              value={chronicInput}
              onChange={(e) => setChronicInput(e.target.value)}
              placeholder="Type 2 Diabetes, Hypertension, Asthma"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Medications (Comma-separated)
            </label>
            <input
              type="text"
              value={medicationsInput}
              onChange={(e) => setMedicationsInput(e.target.value)}
              placeholder="Metformin 500mg, Lisinopril 10mg"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Clinical Visit Notes & Examination Diagnostics
            </label>
            <textarea
              rows="4"
              value={visitNotesInput}
              onChange={(e) => setVisitNotesInput(e.target.value)}
              placeholder="Enter clinical visit summary, diagnostic observations, or physician notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg shadow-sm transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isSaving ? "Saving Record..." : "Save & Audit Log Entry"}
            </button>
          </div>
        </form>
      ) : (
        /* Display Mode Cards */
        <div className="space-y-6">
          {/* Top 3 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Allergies Card */}
            <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-4">
              <div className="flex items-center text-red-800 font-bold text-xs uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4 mr-1.5 text-red-600" />
                Allergies & Sensitivities
              </div>
              {medicalRecord?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicalRecord.allergies.map((allergy, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-red-100 text-red-800 font-semibold text-xs rounded-md border border-red-200"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">
                  No known allergies logged.
                </p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4 mr-1.5 text-amber-600" />
                Chronic Conditions
              </div>
              {medicalRecord?.chronic_conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicalRecord.chronic_conditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-amber-100 text-amber-900 font-semibold text-xs rounded-md border border-amber-200"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">
                  No chronic conditions recorded.
                </p>
              )}
            </div>

            {/* Current Medications */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center text-blue-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Pill className="w-4 h-4 mr-1.5 text-blue-600" />
                Current Prescriptions
              </div>
              {medicalRecord?.current_medications?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {medicalRecord.current_medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-blue-100 text-blue-900 font-semibold text-xs rounded-md border border-blue-200"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">
                  No active prescriptions.
                </p>
              )}
            </div>
          </div>

          {/* Timeline Visit Notes Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Clinical Notes & Visit Documentation</span>
              </div>
              {medicalRecord?.updated_at && (
                <div className="text-xs text-slate-500 flex items-center font-mono">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Last Updated:{" "}
                  {new Date(medicalRecord.updated_at).toLocaleString()} by{" "}
                  {medicalRecord.updated_by || "Staff"}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {medicalRecord?.visit_notes ||
                "No recent clinical visit notes entered."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
