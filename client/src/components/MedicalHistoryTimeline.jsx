import React from "react";
import {
  FileText,
  AlertTriangle,
  Pill,
  UserCheck,
  Clock,
  FilePlus,
} from "lucide-react";

export default function MedicalHistoryTimeline({
  records = [],
  loading = false,
  error = null,
  onOpenNoteModal,
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>Medical History & Clinical Notes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological record of clinical notes, consultation history,
            allergies, and medications.
          </p>
        </div>

        {onOpenNoteModal && (
          <button
            onClick={onOpenNoteModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            <FilePlus className="w-4 h-4" />
            <span>Add Clinical Note</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
          Failed to load medical records: {error}
        </div>
      )}

      {/* Records Timeline */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mb-2"></div>
          <p>Loading medical timeline...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-slate-600 text-sm">
            No clinical records found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Add Clinical Note" above to record a consultation or
            observation.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {records.map((record) => (
            <div key={record.id} className="relative group">
              {/* Timeline Marker Bullet */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-600 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              </div>

              {/* Card Content */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-xs">
                {/* Header: Date & Attending Doctor */}
                <div className="flex items-center justify-between gap-4 mb-3 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>
                      {record.doctor?.full_name
                        ? `Dr. ${record.doctor.full_name}`
                        : "Attending Healthcare Staff"}
                    </span>
                    {record.doctor?.specialty && (
                      <span className="text-slate-400 font-normal">
                        ({record.doctor.specialty})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(record.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Allergies & Medications Badges if present */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {record.allergies && (
                    <div className="bg-amber-50 border border-amber-200/80 rounded px-3 py-2 text-xs">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Allergies
                      </span>
                      <p className="text-amber-900">{record.allergies}</p>
                    </div>
                  )}

                  {record.current_medications && (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded px-3 py-2 text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-0.5">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        Active Medications
                      </span>
                      <p className="text-emerald-900">
                        {record.current_medications}
                      </p>
                    </div>
                  )}
                </div>

                {/* Clinical Note Body */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Clinical Notes & Observations
                  </h4>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {record.clinical_notes}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
