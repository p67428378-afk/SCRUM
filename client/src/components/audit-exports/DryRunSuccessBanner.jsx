import React from "react";

export default function DryRunSuccessBanner({
  message,
  entriesProcessed,
  onClose,
}) {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-secondary-container/10 border border-secondary/30 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/20 text-secondary shrink-0">
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
      </div>
      <div className="flex-1">
        <p className="font-body-md font-semibold text-secondary">
          Dry-run successful
        </p>
        <p className="font-body-sm text-on-secondary-container">{message}</p>
        {entriesProcessed !== undefined && entriesProcessed !== null && (
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            Entries Processed: {entriesProcessed}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
