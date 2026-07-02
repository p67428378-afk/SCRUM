import React from "react";
import { CheckCircle, Calendar, Hash, FileText, RefreshCw } from "lucide-react";

export default function ConfirmationBanner({ confirmationData, onReset }) {
  if (!confirmationData) return null;

  const { confirmation_number, submission_id, summary, timestamp } =
    confirmationData;

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString();

  return (
    <div className="bg-white rounded-xl border border-green-200 shadow-lg overflow-hidden animate-fade-in">
      {/* Header Banner */}
      <div className="bg-green-600 p-6 text-white flex items-center gap-4">
        <div className="p-3 bg-green-500/30 rounded-full border border-green-400/30 shrink-0">
          <CheckCircle size={32} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Assortment Submitted Successfully!
          </h3>
          <p className="text-xs text-green-100 mt-0.5">
            The category assortment decision has been recorded and locked in the
            audit trail.
          </p>
        </div>
      </div>

      {/* Audit Trail Details */}
      <div className="p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 text-sm">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Audit Trail Summary
          </h4>

          {/* Confirmation Number */}
          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Hash size={14} className="text-gray-400" />
              <span>Confirmation Number</span>
            </div>
            <span className="font-mono font-bold text-gray-900">
              {confirmation_number}
            </span>
          </div>

          {/* Submission ID */}
          <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <FileText size={14} className="text-gray-400" />
              <span>Submission ID</span>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {submission_id}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <Calendar size={14} className="text-gray-400" />
              <span>Timestamp</span>
            </div>
            <span className="text-gray-700 font-medium">{formattedDate}</span>
          </div>
        </div>

        {/* Summary Text */}
        <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-sm text-green-800">
          <p className="font-semibold">Summary of Actions:</p>
          <p className="mt-1 text-green-700 leading-relaxed">{summary}</p>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg font-bold text-sm flex items-center gap-2 shadow transition-all active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            <span>Start New Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
