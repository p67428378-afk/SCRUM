import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import PatientProfileBanner from "../components/PatientProfileBanner";
import MedicalHistoryTimeline from "../components/MedicalHistoryTimeline";
import { getPatient, getMedicalHistory } from "../services/api";

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatientDetails = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const patientData = await getPatient(id);
      setPatient(patientData);

      try {
        const medData = await getMedicalHistory(id);
        setMedicalRecord(medData);
      } catch (medErr) {
        // Medical history might be empty or fallback
        setMedicalRecord(patientData.medical_record || null);
      }
    } catch (err) {
      console.error("Error loading patient profile:", err);
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to load patient record. Please check patient ID.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatientDetails();
  }, [loadPatientDetails]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200/80 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Patient Directory
          </Link>

          <button
            onClick={loadPatientDetails}
            disabled={isLoading}
            className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200/80 shadow-sm transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">
              Fetching patient chart and medical records...
            </p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Patient Not Found
            </h3>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Directory
            </Link>
          </div>
        ) : (
          <>
            {/* Patient Header Banner */}
            <PatientProfileBanner
              patient={patient}
              medicalHistory={medicalRecord}
            />

            {/* Medical History & Clinical Timeline */}
            <MedicalHistoryTimeline
              patientId={patient.id}
              medicalRecord={medicalRecord}
              onRefresh={loadPatientDetails}
            />
          </>
        )}
      </main>
    </div>
  );
}
