import React from "react";

export default function TriggerDryRunModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
  successMessage,
  entriesProcessed,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">
              science
            </span>
            Trigger Dry-Run Export
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {successMessage ? (
            <div className="bg-secondary/10 border border-secondary/30 text-secondary p-4 rounded-lg flex items-start gap-3">
              <span
                className="material-symbols-outlined shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <div>
                <p className="font-semibold">Dry-Run Successful</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {successMessage}
                </p>
                {entriesProcessed !== undefined &&
                  entriesProcessed !== null && (
                    <p className="text-xs text-on-surface-variant mt-2 font-mono">
                      Entries Processed: {entriesProcessed}
                    </p>
                  )}
              </div>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0">error</span>
              <div>
                <p className="font-semibold">Dry-Run Failed</p>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Are you sure you want to trigger an immediate, non-persisting
              dry-run? This will simulate a real export by gathering and
              encrypting the data, but will not save the output file to GCS or
              any other storage.
            </p>
          )}
        </div>
        <div className="px-6 py-4 bg-[#111827] border-t border-[#334155] flex justify-end gap-3">
          {successMessage || error ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#334155] hover:bg-[#475569] text-on-surface rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 bg-[#334155] hover:bg-[#475569] text-on-surface rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-secondary hover:bg-secondary-fixed text-on-secondary rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">
                      sync
                    </span>
                    Simulating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      science
                    </span>
                    Run Simulation
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
