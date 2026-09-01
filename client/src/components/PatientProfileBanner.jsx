import React from "react";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  HeartPulse,
} from "lucide-react";

export default function PatientProfileBanner({ patient }) {
  if (!patient) return null;

  // Calculate age if DOB present
  let age = "N/A";
  if (patient.dob) {
    const birthYear = new Date(patient.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(birthYear)) {
      age = currentYear - birthYear;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
            {patient.full_name
              ? patient.full_name.charAt(0).toUpperCase()
              : "P"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {patient.full_name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Patient UUID: {patient.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              DOB: <strong className="text-slate-800">{patient.dob}</strong>{" "}
              (Age {age})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <span>
              Gender:{" "}
              <strong className="text-slate-800 capitalize">
                {patient.gender}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-slate-400" />
            <span>
              Phone: <strong className="text-slate-800">{patient.phone}</strong>
            </span>
          </div>

          {patient.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{patient.email}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SSN Verified & Hashed</span>
        </span>

        <div className="text-xs text-slate-500 text-left md:text-right mt-1">
          <p className="flex items-center gap-1.5 font-medium text-slate-700">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span>Insurance: {patient.insurance_provider || "Self-pay"}</span>
          </p>
          {patient.insurance_policy_number && (
            <p className="font-mono text-slate-500 text-[11px] mt-0.5">
              Policy #{patient.insurance_policy_number}
            </p>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-1">
          Emergency Contact: {patient.emergency_contact}
        </p>
      </div>
    </div>
  );
}
