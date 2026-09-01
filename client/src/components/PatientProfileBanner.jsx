import React from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  FileText,
} from "lucide-react";

export default function PatientProfileBanner({ patient, medicalHistory }) {
  if (!patient) return null;

  const insuranceText =
    typeof patient.insurance_info === "string"
      ? patient.insurance_info
      : patient.insurance_info?.provider
        ? `${patient.insurance_info.provider} (${patient.insurance_info.policy_number || "No Policy #"})`
        : "Self-Pay / Uninsured";

  const emergency =
    typeof patient.emergency_contact === "string"
      ? patient.emergency_contact
      : patient.emergency_contact?.name
        ? `${patient.emergency_contact.name} (${patient.emergency_contact.relationship || "Contact"}) - ${patient.emergency_contact.phone || "N/A"}`
        : "None Listed";

  const hasSevereAllergies =
    medicalHistory?.allergies &&
    medicalHistory.allergies.some(
      (a) =>
        a.toLowerCase().includes("severe") ||
        a.toLowerCase().includes("penicillin"),
    );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* High-Risk Allergy Warning Banner */}
      {hasSevereAllergies && (
        <div className="bg-red-600 text-white px-6 py-2.5 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 animate-pulse text-amber-200" />
            <span className="font-bold text-sm tracking-wide">
              HIGH RISK ALLERGY ALERT: {medicalHistory.allergies.join(", ")}
            </span>
          </div>
          <span className="text-xs bg-red-800 px-2 py-0.5 rounded font-mono font-semibold">
            CRITICAL PHI FLAG
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Patient Identity */}
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-slate-800">
              {patient.full_name
                ? patient.full_name.charAt(0).toUpperCase()
                : "P"}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {patient.full_name}
                </h1>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full font-mono">
                  {patient.patient_code || "PAT-1001"}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-mono mt-1 flex items-center space-x-2">
                <span>UUID: {patient.id}</span>
              </div>

              {/* Quick Demographics */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
                <span className="flex items-center font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  DOB: {patient.date_of_birth}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-medium">Gender: {patient.gender}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center font-medium">
                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {patient.contact_number}
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center font-medium">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {patient.email || "No Email"}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Details Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2 min-w-[280px]">
            <div className="flex items-center text-slate-700">
              <Shield className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">Insurance: </span>
                <strong className="text-slate-900">{insuranceText}</strong>
              </div>
            </div>

            <div className="flex items-center text-slate-700">
              <Phone className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">Emergency: </span>
                <strong className="text-slate-900">{emergency}</strong>
              </div>
            </div>

            <div className="flex items-center text-slate-700">
              <MapPin className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">Address: </span>
                <span className="text-slate-800">
                  {patient.address || "N/A"}
                </span>
              </div>
            </div>

            {patient.ssn && (
              <div className="flex items-center text-slate-700 font-mono">
                <FileText className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-medium font-sans">
                    SSN:{" "}
                  </span>
                  <span className="text-slate-800">{patient.ssn}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
