import React from "react";

export default function SubmissionConfirmationModal({
  isOpen,
  onClose,
  submissionResult,
  scenarioName,
}) {
  if (!isOpen || !submissionResult) return null;

  const {
    audit_trail_id = "",
    status = "",
    submitted_at = "",
    submitted_by = "",
  } = submissionResult;

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      {/* Backdrop */}
      <div class="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal Content */}
      <div class="relative w-full max-w-md mx-auto my-6 z-50">
        <div class="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-surface-container-lowest outline-none focus:outline-none p-6">
          {/* Header */}
          <div class="flex items-start justify-between border-b border-outline-variant pb-3 mb-4">
            <h3 class="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">
                check_circle
              </span>
              Plan Submitted Successfully
            </h3>
            <button
              class="p-1 ml-auto bg-transparent border-0 text-secondary hover:text-on-surface float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onClose}
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div class="relative flex-auto font-body-sm text-body-sm text-on-surface space-y-4">
            <p>
              The assortment plan for the <strong>{scenarioName}</strong>{" "}
              scenario has been successfully submitted and logged for audit
              purposes.
            </p>

            <div class="bg-surface p-4 rounded-lg border border-outline-variant space-y-2 font-mono-label text-[12px]">
              <div class="flex justify-between">
                <span class="text-secondary">Status:</span>
                <span class="font-bold text-primary uppercase">{status}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Audit Trail ID:</span>
                <span class="font-bold text-on-surface select-all">
                  {audit_trail_id}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Submitted By:</span>
                <span class="font-bold text-on-surface">{submitted_by}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary">Submitted At:</span>
                <span class="font-bold text-on-surface">
                  {new Date(submitted_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="flex items-center justify-end border-t border-outline-variant pt-3 mt-4">
            <button
              class="px-6 py-2 bg-primary-container text-[#0F172A] font-bold rounded hover:bg-primary-fixed transition-colors"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
