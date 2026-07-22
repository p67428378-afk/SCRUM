import React from "react";

export default function TriggerExportModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
  successMessage,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#334155] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              import_export
            </span>
            Trigger Manual Export
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
            <div className="bg-primary/10 border border-primary/30 text-primary p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0">
                check_circle
              </span>
              <div>
                <p className="font-semibold">Export Initiated</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {successMessage}
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg flex items-start gap-3">
              <span className="material-symbols-outlined shrink-0">error</span>
              <div>
                <p className="font-semibold">Export Failed</p>
                <p className="text-sm text-on-surface-variant mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Are you sure you want to manually trigger an audit log export?
              This will collect all system audit logs, encrypt them using
              AES-256, and upload them to the configured GCS bucket.
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
                className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary-container rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">
                      sync
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      play_circle
                    </span>
                    Trigger Now
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
