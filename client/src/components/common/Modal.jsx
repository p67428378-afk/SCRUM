import React from "react";

export default function Modal({ isOpen, onClose, submissionData }) {
  if (!isOpen) return null;

  const data = submissionData || {
    submission_id: "uuid-audit-789",
    status: "SUBMITTED & ARCHIVED",
    timestamp: "2026-01-01 12:00:00 UTC",
    submitted_by: "manager@example.com",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      id="success-modal"
    >
      <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center transform scale-100 transition-transform">
        <button
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-highest transition-colors"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
          <span className="material-symbols-outlined text-emerald-400 text-[40px]">
            check_circle
          </span>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Plan Submitted Successfully
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          The assortment strategy has been routed for final execution.
        </p>
        <div className="w-full bg-surface-container rounded-lg p-4 text-left border border-outline-variant space-y-3">
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Submission ID
            </span>
            <span className="font-data-mono text-sm text-on-surface">
              {data.submission_id}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Status
            </span>
            <span className="font-data-mono text-sm text-emerald-400 font-bold">
              {data.status}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Timestamp
            </span>
            <span className="font-data-mono text-sm text-on-surface">
              {data.timestamp}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              Submitted By
            </span>
            <span className="font-data-mono text-sm text-on-surface">
              {data.submitted_by}
            </span>
          </div>
        </div>
        <button
          className="w-full mt-8 py-3 bg-surface-container border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
          onClick={onClose}
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
