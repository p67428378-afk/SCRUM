import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react";
import { ArrowLeft, Calendar, FilePlus, User } from "lucide-react";
import PatientProfileBanner from "../components/PatientProfileBanner";
import MedicalHistoryTimeline from "../components/MedicalHistoryTimeline";
import ClinicalNoteForm from "../components/ClinicalNoteForm";
import { getPatient, getPatientRecords } from "../services/api";

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, rData] = await Promise.all([
        getPatient(id),
        getPatientRecords(id),
      ]);
      setPatient(pData);
      setRecords(rData || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load patient detail page:", err);
      setError(
        err.response?.data?.detail || "Failed to load patient EMR record.",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const handleRecordCreated = (newRecord) => {
    fetchPatientData();
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2"></div>
        <p className="text-sm font-medium">Loading patient EMR record...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-white p-8 rounded-lg border border-red-200 shadow-sm text-center max-w-lg mx-auto my-8">
        <User className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Patient Not Found
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          {error || "Unable to locate patient record with UUID " + id}
        </p>
        <button
          onClick={() => navigate("/patients")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-medium text-sm rounded-lg hover:bg-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/patients")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/appointments?patient_id=${patient.id}`)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs rounded-lg transition-colors border border-emerald-200"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Schedule Appointment</span>
          </button>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <FilePlus className="w-4 h-4" />
            <span>Append Clinical Note</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Header Banner */}
      <PatientProfileBanner patient={patient} />

      {/* Medical History Timeline */}
      <MedicalHistoryTimeline
        records={records}
        loading={false}
        error={null}
        onOpenNoteModal={() => setIsNoteModalOpen(true)}
      />

      {/* Add Note Modal */}
      <ClinicalNoteForm
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        patientId={patient.id}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  );
}
